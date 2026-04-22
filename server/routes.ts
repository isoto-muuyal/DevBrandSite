import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import { ZodError } from "zod";
import { adminSecrets } from "./admin-secrets";
import { getAnalyticsReport, getUniqueVisitCount, recordEvent } from "./analytics";
import { sendContactMessageWithMailerSend } from "./mailersend";
import { insertArticleSchema } from "@shared/schema";
import multer from "multer";

function normalizeIp(ip: string) {
  if (ip.startsWith("::ffff:")) {
    return ip.slice(7);
  }
  return ip;
}

function getClientIp(req: Request): string {
  const candidates = [
    req.headers["cf-connecting-ip"],
    req.headers["true-client-ip"],
    req.headers["x-real-ip"],
    req.headers["x-client-ip"],
    req.headers["x-forwarded-for"],
    req.ip,
    req.socket.remoteAddress,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return normalizeIp(candidate.split(",")[0].trim());
    }
    if (Array.isArray(candidate) && candidate.length > 0) {
      return normalizeIp(candidate[0]);
    }
  }

  return "unknown";
}

function getLocationFromHeaders(req: Request): string {
  const country =
    req.headers["cf-ipcountry"] ||
    req.headers["x-vercel-ip-country"] ||
    req.headers["cloudfront-viewer-country"] ||
    req.headers["x-appengine-country"];

  const region =
    req.headers["x-vercel-ip-country-region"] ||
    req.headers["cloudfront-viewer-country-region"];

  const city = req.headers["x-vercel-ip-city"] || req.headers["cloudfront-viewer-city"];

  const values = [city, region, country]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .map((value) => value.trim());

  return values.length > 0 ? values.join(", ") : "unknown";
}

function requireAdmin(req: Request, res: Response): boolean {
  if ((req.session as any)?.isAdmin) {
    return true;
  }

  res.status(401).json({ message: "Unauthorized" });
  return false;
}

function buildBaseEvent(req: Request, page: string) {
  return {
    ip: getClientIp(req),
    location: getLocationFromHeaders(req),
    page,
    timestamp: new Date().toISOString(),
  };
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }

    cb(new Error("Only image uploads are allowed"));
  },
});

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const isPdf = file.mimetype === "application/pdf" || path.extname(file.originalname || "").toLowerCase() === ".pdf";
    if (isPdf) {
      cb(null, true);
      return;
    }

    cb(new Error("Only PDF uploads are allowed"));
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/content/blog_entries/img/:filename", async (req, res) => {
    try {
      const image = await storage.getBlogImage(req.params.filename);
      if (!image) {
        return res.status(404).end();
      }

      res.setHeader("Content-Type", image.contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.status(200).send(image.body);
    } catch {
      res.status(500).end();
    }
  });

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.post("/api/visit", (req, res) => {
    const page = typeof req.body?.page === "string" && req.body.page.trim() ? req.body.page.trim() : "/";
    const result = recordEvent({
      ...buildBaseEvent(req, page),
      type: "visit",
    });

    res.status(200).json(result);
  });

  app.post("/api/interaction", (req, res) => {
    const page = typeof req.body?.page === "string" && req.body.page.trim() ? req.body.page.trim() : "/";
    const target = typeof req.body?.target === "string" && req.body.target.trim() ? req.body.target.trim() : "unknown-target";

    recordEvent({
      ...buildBaseEvent(req, `${page} :: ${target}`),
      type: "interaction",
      target,
    });

    res.status(200).json({ ok: true });
  });

  app.get("/api/visit/summary", (_req, res) => {
    res.json({ uniqueVisits: getUniqueVisitCount() });
  });

  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body || {};

    if (username === adminSecrets.username && password === adminSecrets.password) {
      (req.session as any).isAdmin = true;
      return res.status(200).json({ message: "Login successful" });
    }

    res.status(401).json({ message: "Invalid username or password" });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out" });
    });
  });

  app.get("/api/admin/report", (req, res) => {
    if (!requireAdmin(req, res)) {
      return;
    }

    res.status(200).json(getAnalyticsReport());
  });

  app.get("/api/admin/blog-entries", async (req, res) => {
    if (!requireAdmin(req, res)) {
      return;
    }

    try {
      const articles = await storage.getArticles();
      res.status(200).json(articles);
    } catch {
      res.status(500).json({ message: "Failed to load blog entries" });
    }
  });

  app.get("/api/admin/resume", async (req, res) => {
    if (!requireAdmin(req, res)) {
      return;
    }

    try {
      const resume = await storage.getResumeInfo();
      res.status(200).json({ resume });
    } catch {
      res.status(500).json({ message: "Failed to load resume info" });
    }
  });

  app.post(
    "/api/admin/blog-images",
    (req, res, next) => {
      if (!requireAdmin(req, res)) {
        return;
      }
      next();
    },
    upload.single("image"),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      try {
        const saved = await storage.saveBlogImage({
          buffer: req.file.buffer,
          mimeType: req.file.mimetype,
          originalName: req.file.originalname,
        });

        res.status(201).json(saved);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload image";
        res.status(500).json({ message });
      }
    },
  );

  app.post(
    "/api/admin/resume",
    (req, res, next) => {
      if (!requireAdmin(req, res)) {
        return;
      }
      next();
    },
    resumeUpload.single("resume"),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ message: "No resume uploaded" });
      }

      try {
        const saved = await storage.saveResume({
          buffer: req.file.buffer,
          mimeType: req.file.mimetype,
          originalName: req.file.originalname,
        });

        res.status(201).json({ resume: saved });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload resume";
        res.status(500).json({ message });
      }
    },
  );

  app.post("/api/admin/blog-entries", async (req, res) => {
    if (!requireAdmin(req, res)) {
      return;
    }

    try {
      const payload = insertArticleSchema.parse(req.body);
      const created = await storage.createArticle(payload);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid blog entry payload" });
      }

      const message = error instanceof Error ? error.message : "Failed to create blog entry";
      res.status(400).json({ message });
    }
  });

  app.put("/api/admin/blog-entries/:id", async (req, res) => {
    if (!requireAdmin(req, res)) {
      return;
    }

    try {
      const payload = insertArticleSchema.parse(req.body);
      const updated = await storage.updateArticle(req.params.id, payload);

      if (!updated) {
        return res.status(404).json({ message: "Blog entry not found" });
      }

      res.status(200).json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid blog entry payload" });
      }

      const message = error instanceof Error ? error.message : "Failed to update blog entry";
      res.status(400).json({ message });
    }
  });

  app.get("/api/projects", async (_req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/featured", async (_req, res) => {
    try {
      const projects = await storage.getFeaturedProjects();
      res.json(projects);
    } catch {
      res.status(500).json({ message: "Failed to fetch featured projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      await sendContactMessageWithMailerSend(validatedData);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json({ message: "Message sent successfully", id: message.id });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid contact form data" });
      }

      console.error("Failed to process contact message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/articles", async (_req, res) => {
    try {
      const articles = await storage.getPublishedArticles();
      res.json(articles);
    } catch {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getPublishedArticle(req.params.slug);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.get("/api/resume/download", async (req, res) => {
    try {
      const resume = await storage.getResume();
      if (!resume) {
        res.status(404).json({ message: "Resume file not found" });
        return;
      }

      recordEvent({
        ...buildBaseEvent(req, "/contact :: resume-download"),
        type: "download",
        target: "resume-download",
      });

      res.setHeader("Content-Type", resume.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${resume.filename}"`);
      res.status(200).send(resume.body);
    } catch {
      res.status(500).json({ message: "Failed to download resume" });
    }
  });

  return createServer(app);
}

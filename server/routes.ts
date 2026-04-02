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

export async function registerRoutes(app: Express): Promise<Server> {
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
      const articles = await storage.getArticles();
      res.json(articles);
    } catch {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.slug);
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
      const resumePath = path.join(process.cwd(), "attached_assets", "Israel_Soto_Resume_1756754540992.pdf");

      if (fs.existsSync(resumePath)) {
        recordEvent({
          ...buildBaseEvent(req, "/contact :: resume-download"),
          type: "download",
          target: "resume-download",
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="israel-soto-resume.pdf"');

        const fileStream = fs.createReadStream(resumePath);
        fileStream.pipe(res);
      } else {
        res.status(404).json({ message: "Resume file not found" });
      }
    } catch {
      res.status(500).json({ message: "Failed to download resume" });
    }
  });

  return createServer(app);
}

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "https";
import { storage } from "./storage";
import { insertContactMessageSchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import { adminSecrets } from "./admin-secrets";
import { getUniqueVisitCount, getVisitReport, recordVisit } from "./analytics";

function getClientIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  let rawIp = "";

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    rawIp = forwardedFor.split(",")[0].trim();
  } else if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    rawIp = forwardedFor[0];
  } else {
    rawIp = req.socket.remoteAddress || "unknown";
  }

  if (rawIp.startsWith("::ffff:")) {
    return rawIp.slice(7);
  }

  return rawIp;
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
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .map((v) => v.trim());

  if (values.length === 0) {
    return "unknown";
  }

  return values.join(", ");
}

function requireAdmin(req: Request, res: Response): boolean {
  if ((req.session as any)?.isAdmin) {
    return true;
  }

  res.status(401).json({ message: "Unauthorized" });
  return false;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Docker
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Track visits and unique visitors (unique by IP)
  app.post("/api/visit", (req, res) => {
    const body = req.body as { page?: unknown };
    const page = typeof body?.page === "string" && body.page.trim() ? body.page.trim() : "/";

    const result = recordVisit({
      ip: getClientIp(req),
      location: getLocationFromHeaders(req),
      page,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(result);
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

    res.status(200).json(getVisitReport());
  });

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get featured projects
  app.get("/api/projects/featured", async (req, res) => {
    try {
      const projects = await storage.getFeaturedProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured projects" });
    }
  });

  // Get single project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json({ message: "Message sent successfully", id: message.id });
    } catch (error) {
      res.status(400).json({ message: "Invalid contact form data" });
    }
  });

  // Get all articles
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Get single article by slug
  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.slug);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Download resume
  app.get("/api/resume/download", async (req, res) => {
    try {
      const resumePath = path.join(process.cwd(), "attached_assets", "Israel_Soto_Resume_1756754540992.pdf");

      if (fs.existsSync(resumePath)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="israel-soto-resume.pdf"');

        const fileStream = fs.createReadStream(resumePath);
        fileStream.pipe(res);
      } else {
        res.status(404).json({ message: "Resume file not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to download resume" });
    }
  });

  const options = {
    //key: fs.readFileSync("/etc/letsencrypt/live/israelsoto.dev/privkey.pem"),
    //cert: fs.readFileSync("/etc/letsencrypt/live/israelsoto.dev/fullchain.pem")
  };

  const httpsServer = createServer(options, app);
  return httpsServer;
}

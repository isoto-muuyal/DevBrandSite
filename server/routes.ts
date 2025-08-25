import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema } from "@shared/schema";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
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
      // In a real application, you would serve an actual PDF file
      // For now, we'll create a simple text response
      const resumeContent = `
ISRAEL SOTO
Full Stack Developer & Tech Innovator

CONTACT INFORMATION
Email: israel.soto@example.com
LinkedIn: linkedin.com/in/israelsoto
GitHub: github.com/israelsoto
Location: San Francisco, CA

EXPERIENCE
Senior Full Stack Developer (2020 - Present)
- Led development teams and architected scalable systems
- Built applications handling millions of requests daily
- Specialized in React, Node.js, and cloud technologies

SKILLS
Frontend: React.js, TypeScript, Tailwind CSS, Next.js
Backend: Node.js, Spring Boot, PostgreSQL, MongoDB
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD

CERTIFICATIONS
- AWS Solutions Architect (2023)
- Google Cloud Professional (2023)
- Kubernetes Administrator (2022)

PROJECTS
- BudgetBuddy: Personal finance management application
- AI CV Builder: AI-powered resume builder
- Microservices Architecture: Complete microservices example
- Ollama API Wrapper: TypeScript wrapper for Ollama API
      `;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="israel-soto-resume.txt"');
      res.send(resumeContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to download resume" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { type Project, type InsertProject, type ContactMessage, type InsertContactMessage, type Article, type InsertArticle } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getFeaturedProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;

  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;

  // Articles
  getArticles(): Promise<Article[]>;
  getArticle(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private contactMessages: Map<string, ContactMessage>;
  private articles: Map<string, Article>;

  constructor() {
    this.projects = new Map();
    this.contactMessages = new Map();
    this.articles = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed projects
    const seedProjects: Project[] = [
      {
        id: "1",
        name: "BudgetBuddy",
        description: "A comprehensive personal finance management application built with React and Node.js. Features include expense tracking, budget planning, and financial insights with beautiful data visualizations.",
        technologies: ["React", "Node.js", "PostgreSQL", "Chart.js", "Tailwind CSS"],
        githubUrl: "https://github.com/example/budgetbuddy",
        liveUrl: "https://budgetbuddy-demo.vercel.app",
        imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        status: "In Development",
        featured: "true",
        createdAt: new Date(),
      },
      {
        id: "2",
        name: "AI CV Builder",
        description: "An intelligent resume builder powered by AI that helps users create professional CVs. Features include template suggestions, content optimization, and ATS-friendly formatting.",
        technologies: ["Next.js", "OpenAI API", "Tailwind CSS", "Supabase", "TypeScript"],
        githubUrl: "https://github.com/example/ai-cv-builder",
        liveUrl: "https://ai-cv-builder.vercel.app",
        imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        status: "Completed",
        featured: "true",
        createdAt: new Date(),
      },
      {
        id: "3",
        name: "Microservices Architecture",
        description: "A complete microservices architecture example demonstrating service discovery, API gateway, distributed tracing, and containerized deployment with Docker and Kubernetes.",
        technologies: ["Spring Boot", "Docker", "Kubernetes", "Redis", "Java"],
        githubUrl: "https://github.com/example/microservices-demo",
        liveUrl: null,
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        status: "Open Source",
        featured: "true",
        createdAt: new Date(),
      },
      {
        id: "4",
        name: "Ollama API Wrapper",
        description: "A TypeScript wrapper for the Ollama API that simplifies local LLM integration. Includes streaming support, error handling, and comprehensive type definitions for seamless development experience.",
        technologies: ["TypeScript", "Node.js", "Ollama", "Jest", "npm"],
        githubUrl: "https://github.com/example/ollama-wrapper",
        liveUrl: null,
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        status: "Published",
        featured: "true",
        createdAt: new Date(),
      }
    ];

    seedProjects.forEach(project => {
      this.projects.set(project.id, project);
    });

    // Seed articles
    const seedArticles: Article[] = [
      {
        id: "1",
        title: "Building Microservices with Spring Boot and Docker",
        excerpt: "A comprehensive guide to designing and implementing a microservices architecture using Spring Boot, Docker containers, and service discovery patterns.",
        content: "Full article content here...",
        tags: ["Spring Boot", "Docker", "Microservices"],
        publishedDate: "March 15, 2024",
        readTime: "8 min read",
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        slug: "microservices-spring-boot-docker",
        createdAt: new Date(),
      },
      {
        id: "2",
        title: "React Performance Optimization Techniques",
        excerpt: "Learn advanced techniques to optimize React applications, including code splitting, memoization, and efficient state management strategies.",
        content: "Full article content here...",
        tags: ["React", "Performance", "JavaScript"],
        publishedDate: "March 8, 2024",
        readTime: "6 min read",
        imageUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        slug: "react-performance-optimization",
        createdAt: new Date(),
      },
      {
        id: "3",
        title: "Integrating AI Models in Web Applications",
        excerpt: "Explore practical approaches to integrating AI models into web applications, covering API design, performance considerations, and user experience patterns.",
        content: "Full article content here...",
        tags: ["AI", "APIs", "Web Development"],
        publishedDate: "February 28, 2024",
        readTime: "10 min read",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        slug: "integrating-ai-models-web-applications",
        createdAt: new Date(),
      }
    ];

    seedArticles.forEach(article => {
      this.articles.set(article.id, article);
    });
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getFeaturedProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.featured === "true");
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }

  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }

  async getArticle(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(a => a.slug === slug);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const article: Article = {
      ...insertArticle,
      id,
      createdAt: new Date(),
    };
    this.articles.set(id, article);
    return article;
  }
}

export const storage = new MemStorage();

import { type Project, type InsertProject, type ContactMessage, type InsertContactMessage, type Article, type InsertArticle } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

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
    // Load projects from JSON file
    this.loadProjects();
    
    // Load articles from JSON file  
    this.loadArticles();
  }
  
  private loadProjects() {
    try {
      const projectsPath = path.join(process.cwd(), 'projects.json');
      if (fs.existsSync(projectsPath)) {
        const projectsData = fs.readFileSync(projectsPath, 'utf8');
        const projectsJson = JSON.parse(projectsData);
        
        projectsJson.forEach((proj: any) => {
          const project: Project = {
            id: proj.id,
            name: proj.title,
            description: proj.description,
            technologies: [], // Not used in new format
            githubUrl: proj.github_url,
            liveUrl: null,
            imageUrl: proj.image_header_url,
            status: "Active",
            featured: "true",
            createdAt: new Date(),
          };
          this.projects.set(project.id, project);
        });
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }
  
  private loadArticles() {
    try {
      const articlesPath = path.join(process.cwd(), 'articles.json');
      if (fs.existsSync(articlesPath)) {
        const articlesData = fs.readFileSync(articlesPath, 'utf8');
        const articlesJson = JSON.parse(articlesData);
        
        articlesJson.forEach((art: any) => {
          const article: Article = {
            id: art.id,
            title: art.title,
            excerpt: this.getExcerpt(art.content),
            content: art.content,
            tags: [],
            publishedDate: new Date().toLocaleDateString(),
            readTime: this.calculateReadTime(art.content),
            imageUrl: art.image_header_url,
            slug: this.createSlug(art.title),
            createdAt: new Date(),
          };
          this.articles.set(article.id, article);
        });
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  }
  
  private getExcerpt(content: string): string {
    const words = content.split(' ');
    return words.slice(0, 30).join(' ') + (words.length > 30 ? '...' : '');
  }
  
  private calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }
  
  private createSlug(title: string): string {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
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

import {
  blogEntryFileSchema,
  type Article,
  type BlogEntryFile,
  type ContactMessage,
  type InsertArticle,
  type InsertContactMessage,
  type InsertProject,
  type Project,
} from "@shared/schema";
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
  updateArticle(id: string, article: InsertArticle): Promise<Article | undefined>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private contactMessages: Map<string, ContactMessage>;
  private articles: Map<string, Article>;
  private articleFiles: Map<string, string>;

  private readonly projectsPath = path.join(process.cwd(), "projects.json");
  private readonly contentRoot = process.env.CONTENT_DATA_DIR || path.join(process.cwd(), "data");
  private readonly blogEntriesDir = path.join(this.contentRoot, "blog_entries");
  private readonly bundledBlogEntriesDir = path.join(process.cwd(), "blog_entries");

  constructor() {
    this.projects = new Map();
    this.contactMessages = new Map();
    this.articles = new Map();
    this.articleFiles = new Map();
    this.seedData();
  }

  private seedData() {
    this.loadProjects();
    this.loadArticles();
  }

  private loadProjects() {
    try {
      if (fs.existsSync(this.projectsPath)) {
        const projectsData = fs.readFileSync(this.projectsPath, "utf8");
        const projectsJson = JSON.parse(projectsData);

        projectsJson.forEach((proj: any) => {
          const project: Project = {
            id: proj.id,
            name: proj.title,
            description: proj.description,
            technologies: [], // Not used in new format
            githubUrl: proj.github_url,
            liveUrl: proj.live_url || null,
            imageUrl: proj.image_header_url,
            blogSlug: null,
            status: "Active",
            featured: "true",
            createdAt: new Date(),
          };
          this.projects.set(project.id, project);
        });
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  }

  private loadArticles() {
    try {
      this.ensureBlogEntriesDir();
      this.bootstrapBlogEntries();

      const files = fs
        .readdirSync(this.blogEntriesDir)
        .filter((file) => file.endsWith(".json"))
        .sort((a, b) => a.localeCompare(b));

      this.articles.clear();
      this.articleFiles.clear();

      files.forEach((file) => {
        const filePath = path.join(this.blogEntriesDir, file);
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = blogEntryFileSchema.parse(JSON.parse(raw));
        const article = this.toArticle(parsed);
        this.articles.set(article.id, article);
        this.articleFiles.set(article.id, filePath);

        const project = this.projects.get(parsed.projectId);
        if (project) {
          project.blogSlug = parsed.slug;
          if (parsed.deployedUrl) {
            project.liveUrl = parsed.deployedUrl;
          }
          if (parsed.githubUrl) {
            project.githubUrl = parsed.githubUrl;
          }
        }
      });
    } catch (error) {
      console.error("Error loading articles:", error);
    }
  }

  private ensureBlogEntriesDir() {
    if (!fs.existsSync(this.contentRoot)) {
      fs.mkdirSync(this.contentRoot, { recursive: true });
    }

    if (!fs.existsSync(this.blogEntriesDir)) {
      fs.mkdirSync(this.blogEntriesDir, { recursive: true });
    }
  }

  private bootstrapBlogEntries() {
    const existingFiles = fs.readdirSync(this.blogEntriesDir).filter((file) => file.endsWith(".json"));

    if (existingFiles.length === 0 && fs.existsSync(this.bundledBlogEntriesDir)) {
      const bundledFiles = fs.readdirSync(this.bundledBlogEntriesDir).filter((file) => file.endsWith(".json"));
      for (const file of bundledFiles) {
        fs.copyFileSync(path.join(this.bundledBlogEntriesDir, file), path.join(this.blogEntriesDir, file));
      }
      return;
    }

    for (const project of this.projects.values()) {
      const slug = this.createSlug(project.name);
      const filePath = path.join(this.blogEntriesDir, `${slug}.json`);
      if (fs.existsSync(filePath)) {
        continue;
      }

      const entry: BlogEntryFile = {
        id: project.id,
        projectId: project.id,
        slug,
        title: project.name,
        excerpt: project.description,
        content: `${project.name} is one of the portfolio projects showcased on this site.\n\nThis entry is placeholder content for now. Replace it with a project overview, the main technical decisions, the implementation challenges, and the results that matter most.\n\nYou can edit this entry from the admin page at any time.`,
        imageUrl: project.imageUrl || "",
        deployedUrl: project.liveUrl || "",
        githubUrl: project.githubUrl || "",
        publishedDate: new Date().toISOString().slice(0, 10),
      };

      this.writeBlogEntryFile(entry);
    }
  }

  private getExcerpt(content: string): string {
    const words = content.trim().split(/\s+/);
    return words.slice(0, 30).join(" ") + (words.length > 30 ? "..." : "");
  }

  private calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  private toArticle(entry: BlogEntryFile): Article {
    const excerpt = entry.excerpt?.trim() || this.getExcerpt(entry.content);

    return {
      id: entry.id,
      projectId: entry.projectId,
      title: entry.title,
      excerpt,
      content: entry.content,
      tags: [],
      publishedDate: entry.publishedDate,
      readTime: this.calculateReadTime(entry.content),
      imageUrl: entry.imageUrl || null,
      deployedUrl: entry.deployedUrl || null,
      githubUrl: entry.githubUrl || null,
      slug: entry.slug,
      createdAt: new Date(),
    };
  }

  private writeBlogEntryFile(entry: BlogEntryFile, previousFilePath?: string) {
    const fileName = `${entry.slug}.json`;
    const nextPath = path.join(this.blogEntriesDir, fileName);
    const serialized = JSON.stringify(entry, null, 2);

    fs.writeFileSync(nextPath, `${serialized}\n`, "utf8");

    if (previousFilePath && previousFilePath !== nextPath && fs.existsSync(previousFilePath)) {
      fs.unlinkSync(previousFilePath);
    }

    this.articleFiles.set(entry.id, nextPath);
  }

  private ensureUniqueSlug(slug: string, currentId?: string) {
    const normalizedSlug = this.createSlug(slug);
    const conflict = Array.from(this.articles.values()).find(
      (article) => article.slug === normalizedSlug && article.id !== currentId,
    );

    if (conflict) {
      throw new Error(`Slug "${normalizedSlug}" is already in use`);
    }

    return normalizedSlug;
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
    const slug = this.ensureUniqueSlug(insertArticle.slug);
    const fileRecord: BlogEntryFile = {
      id,
      projectId: insertArticle.projectId,
      slug,
      title: insertArticle.title,
      excerpt: insertArticle.excerpt,
      content: insertArticle.content,
      imageUrl: insertArticle.imageUrl || "",
      deployedUrl: insertArticle.deployedUrl || "",
      githubUrl: insertArticle.githubUrl || "",
      publishedDate: insertArticle.publishedDate,
    };
    this.writeBlogEntryFile(fileRecord);

    const article = this.toArticle(fileRecord);
    this.articles.set(id, article);

    const project = this.projects.get(insertArticle.projectId);
    if (project) {
      project.blogSlug = article.slug;
      project.liveUrl = article.deployedUrl;
      project.githubUrl = article.githubUrl;
    }

    return article;
  }

  async updateArticle(id: string, insertArticle: InsertArticle): Promise<Article | undefined> {
    const existing = this.articles.get(id);
    if (!existing) {
      return undefined;
    }

    const slug = this.ensureUniqueSlug(insertArticle.slug, id);
    const fileRecord: BlogEntryFile = {
      id,
      projectId: insertArticle.projectId,
      slug,
      title: insertArticle.title,
      excerpt: insertArticle.excerpt,
      content: insertArticle.content,
      imageUrl: insertArticle.imageUrl || "",
      deployedUrl: insertArticle.deployedUrl || "",
      githubUrl: insertArticle.githubUrl || "",
      publishedDate: insertArticle.publishedDate,
    };

    const previousFilePath = this.articleFiles.get(id);
    this.writeBlogEntryFile(fileRecord, previousFilePath);

    const updated = this.toArticle(fileRecord);
    this.articles.set(id, updated);

    const project = this.projects.get(insertArticle.projectId);
    if (project) {
      project.blogSlug = updated.slug;
      project.liveUrl = updated.deployedUrl;
      project.githubUrl = updated.githubUrl;
    }

    return updated;
  }
}

export const storage = new MemStorage();

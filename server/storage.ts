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
import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

type StoredImage = {
  body: Buffer;
  contentType: string;
};

type SavedImage = {
  alt: string;
  path: string;
};

type StoredFile = {
  body: Buffer;
  contentType: string;
  filename: string;
};

type ResumeInfo = {
  filename: string;
  updatedAt: string;
  size: number;
};

export interface IStorage {
  getProjects(): Promise<Project[]>;
  getFeaturedProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;

  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;

  getArticles(): Promise<Article[]>;
  getPublishedArticles(): Promise<Article[]>;
  getArticle(slug: string): Promise<Article | undefined>;
  getPublishedArticle(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: InsertArticle): Promise<Article | undefined>;

  saveBlogImage(file: { buffer: Buffer; mimeType: string; originalName: string }): Promise<SavedImage>;
  getBlogImage(filename: string): Promise<StoredImage | undefined>;
  saveResume(file: { buffer: Buffer; mimeType: string; originalName: string }): Promise<ResumeInfo>;
  getResume(): Promise<StoredFile | undefined>;
  getResumeInfo(): Promise<ResumeInfo | null>;
}

function inferContentType(filename: string) {
  const extension = path.extname(filename).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "image/png";
  }
}

function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export class MemStorage implements IStorage {
  private projects = new Map<string, Project>();
  private contactMessages = new Map<string, ContactMessage>();
  private articles = new Map<string, Article>();
  private articleFiles = new Map<string, string>();
  private initialization: Promise<void> | null = null;

  private readonly projectsPath = path.join(process.cwd(), "projects.json");
  private readonly contentRoot = process.env.CONTENT_DATA_DIR || path.join(process.cwd(), "data");
  private readonly blogEntriesDir = path.join(this.contentRoot, "blog_entries");
  private readonly blogImagesDir = path.join(this.blogEntriesDir, "img");
  private readonly resumeDir = path.join(this.contentRoot, "resume");
  private readonly bundledBlogEntriesDir = path.join(process.cwd(), "blog_entries");
  private readonly storageBackend = process.env.BLOG_STORAGE_BACKEND === "s3" ? "s3" : "local";
  private readonly s3Bucket = process.env.S3_BUCKET || "";
  private readonly s3Prefix = (process.env.S3_PREFIX || "devbrand/blog_entries").replace(/^\/+|\/+$/g, "");
  private readonly s3Client =
    this.storageBackend === "s3" && this.s3Bucket
      ? new S3Client({ region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION })
      : null;

  constructor() {
    this.loadProjects();
  }

  private async ensureInitialized() {
    if (!this.initialization) {
      this.initialization = this.loadArticles();
    }

    await this.initialization;
  }

  private loadProjects() {
    try {
      if (!fs.existsSync(this.projectsPath)) {
        return;
      }

      const projectsData = fs.readFileSync(this.projectsPath, "utf8");
      const projectsJson = JSON.parse(projectsData);

      projectsJson.forEach((proj: any) => {
        const project: Project = {
          id: proj.id,
          name: proj.title,
          description: proj.description,
          technologies: [],
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
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  }

  private async loadArticles() {
    try {
      if (this.storageBackend === "s3" && this.s3Client && this.s3Bucket) {
        await this.loadArticlesFromS3();
        return;
      }

      this.loadArticlesFromLocalFs();
    } catch (error) {
      console.error("Error loading articles:", error);
    }
  }

  private loadArticlesFromLocalFs() {
    this.ensureLocalDirectories();
    this.bootstrapLocalBlogEntries();

    const files = fs
      .readdirSync(this.blogEntriesDir)
      .filter((file) => file.endsWith(".json"))
      .sort((a, b) => a.localeCompare(b));

    this.articles.clear();
    this.articleFiles.clear();

    for (const file of files) {
      const filePath = path.join(this.blogEntriesDir, file);
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = blogEntryFileSchema.parse(JSON.parse(raw));
      this.storeArticleInMemory(this.toArticle(parsed), filePath);
    }
  }

  private async loadArticlesFromS3() {
    await this.bootstrapS3BlogEntries();

    const response = await this.s3Client!.send(
      new ListObjectsV2Command({
        Bucket: this.s3Bucket,
        Prefix: `${this.s3Prefix}/`,
      }),
    );

    const keys = (response.Contents || [])
      .map((item) => item.Key)
      .filter((key): key is string => Boolean(key) && key.endsWith(".json"))
      .sort((a, b) => a.localeCompare(b));

    this.articles.clear();
    this.articleFiles.clear();

    for (const key of keys) {
      const raw = await this.readS3ObjectAsString(key);
      const parsed = blogEntryFileSchema.parse(JSON.parse(raw));
      this.storeArticleInMemory(this.toArticle(parsed), key);
    }
  }

  private ensureLocalDirectories() {
    if (!fs.existsSync(this.contentRoot)) {
      fs.mkdirSync(this.contentRoot, { recursive: true });
    }

    if (!fs.existsSync(this.blogEntriesDir)) {
      fs.mkdirSync(this.blogEntriesDir, { recursive: true });
    }

    if (!fs.existsSync(this.blogImagesDir)) {
      fs.mkdirSync(this.blogImagesDir, { recursive: true });
    }

    if (!fs.existsSync(this.resumeDir)) {
      fs.mkdirSync(this.resumeDir, { recursive: true });
    }
  }

  private bootstrapLocalBlogEntries() {
    const existingFiles = new Set(
      fs.readdirSync(this.blogEntriesDir).filter((file) => file.endsWith(".json")),
    );

    if (fs.existsSync(this.bundledBlogEntriesDir)) {
      const bundledFiles = fs
        .readdirSync(this.bundledBlogEntriesDir)
        .filter((file) => file.endsWith(".json"));

      for (const file of bundledFiles) {
        if (existingFiles.has(file)) continue;
        fs.copyFileSync(path.join(this.bundledBlogEntriesDir, file), path.join(this.blogEntriesDir, file));
        existingFiles.add(file);
      }
    }

    for (const project of this.projects.values()) {
      const entry = this.defaultEntryForProject(project);
      const filePath = path.join(this.blogEntriesDir, `${entry.slug}.json`);
      if (fs.existsSync(filePath)) continue;
      this.writeBlogEntryLocal(entry);
    }
  }

  private async bootstrapS3BlogEntries() {
    if (!this.s3Client || !this.s3Bucket) {
      return;
    }

    if (fs.existsSync(this.bundledBlogEntriesDir)) {
      const bundledFiles = fs
        .readdirSync(this.bundledBlogEntriesDir)
        .filter((file) => file.endsWith(".json"));

      for (const file of bundledFiles) {
        const key = this.s3JsonKey(file.replace(/\.json$/, ""));
        if (await this.s3ObjectExists(key)) continue;
        const raw = fs.readFileSync(path.join(this.bundledBlogEntriesDir, file), "utf8");
        await this.writeBlogEntryS3(JSON.parse(raw) as BlogEntryFile);
      }
    }

    for (const project of this.projects.values()) {
      const entry = this.defaultEntryForProject(project);
      const key = this.s3JsonKey(entry.slug);
      if (await this.s3ObjectExists(key)) continue;
      await this.writeBlogEntryS3(entry);
    }
  }

  private defaultEntryForProject(project: Project): BlogEntryFile {
    return {
      id: project.id,
      projectId: project.id,
      slug: this.createSlug(project.name),
      title: project.name,
      status: "published",
      excerpt: project.description,
      content: `${project.name} is one of the portfolio projects showcased on this site.\n\nThis entry is placeholder content for now. Replace it with a project overview, the main technical decisions, the implementation challenges, and the results that matter most.\n\nYou can edit this entry from the admin page at any time.`,
      imageUrl: project.imageUrl || "",
      deployedUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
      publishedDate: new Date().toISOString().slice(0, 10),
    };
  }

  private getExcerpt(content: string) {
    const words = content.trim().split(/\s+/);
    return words.slice(0, 30).join(" ") + (words.length > 30 ? "..." : "");
  }

  private calculateReadTime(content: string) {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  private createSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  private storeArticleInMemory(article: Article, fileRef: string) {
    this.articles.set(article.id, article);
    this.articleFiles.set(article.id, fileRef);

    const project = this.projects.get(article.projectId);
    if (project) {
      project.blogSlug = article.slug;
      if (article.deployedUrl) project.liveUrl = article.deployedUrl;
      if (article.githubUrl) project.githubUrl = article.githubUrl;
    }
  }

  private toArticle(entry: BlogEntryFile): Article {
    const excerpt = entry.excerpt?.trim() || this.getExcerpt(entry.content);

    return {
      id: entry.id,
      projectId: entry.projectId,
      title: entry.title,
      status: entry.status,
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

  private s3JsonKey(slug: string) {
    return `${this.s3Prefix}/${slug}.json`;
  }

  private s3ImageKey(filename: string) {
    return `${this.s3Prefix}/img/${filename}`;
  }

  private s3ResumeKey() {
    return `${this.s3Prefix}/resume/latest-resume.pdf`;
  }

  private async s3ObjectExists(key: string) {
    try {
      await this.s3Client!.send(
        new HeadObjectCommand({
          Bucket: this.s3Bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  private async readS3ObjectAsString(key: string) {
    const response = await this.s3Client!.send(
      new GetObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new Error(`Empty S3 object body for ${key}`);
    }

    const body = await streamToBuffer(response.Body as NodeJS.ReadableStream);
    return body.toString("utf8");
  }

  private async readS3ObjectBuffer(key: string): Promise<StoredImage | undefined> {
    try {
      const response = await this.s3Client!.send(
        new GetObjectCommand({
          Bucket: this.s3Bucket,
          Key: key,
        }),
      );

      if (!response.Body) {
        return undefined;
      }

      const body = await streamToBuffer(response.Body as NodeJS.ReadableStream);
      return {
        body,
        contentType: response.ContentType || inferContentType(key),
      };
    } catch {
      return undefined;
    }
  }

  private async readS3File(key: string, fallbackFilename: string): Promise<StoredFile | undefined> {
    try {
      const response = await this.s3Client!.send(
        new GetObjectCommand({
          Bucket: this.s3Bucket,
          Key: key,
        }),
      );

      if (!response.Body) {
        return undefined;
      }

      const body = await streamToBuffer(response.Body as NodeJS.ReadableStream);
      return {
        body,
        contentType: response.ContentType || "application/octet-stream",
        filename: fallbackFilename,
      };
    } catch {
      return undefined;
    }
  }

  private writeBlogEntryLocal(entry: BlogEntryFile, previousFilePath?: string) {
    const nextPath = path.join(this.blogEntriesDir, `${entry.slug}.json`);
    fs.writeFileSync(nextPath, `${JSON.stringify(entry, null, 2)}\n`, "utf8");

    if (previousFilePath && previousFilePath !== nextPath && fs.existsSync(previousFilePath)) {
      fs.unlinkSync(previousFilePath);
    }

    this.articleFiles.set(entry.id, nextPath);
  }

  private async writeBlogEntryS3(entry: BlogEntryFile, previousKey?: string) {
    const nextKey = this.s3JsonKey(entry.slug);
    await this.s3Client!.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: nextKey,
        Body: `${JSON.stringify(entry, null, 2)}\n`,
        ContentType: "application/json; charset=utf-8",
      }),
    );

    this.articleFiles.set(entry.id, nextKey);

    if (previousKey && previousKey !== nextKey) {
      // Leaving the old object in place is acceptable; deleting would need extra permissions.
    }
  }

  private async persistBlogEntry(entry: BlogEntryFile, previousFileRef?: string) {
    if (this.storageBackend === "s3" && this.s3Client && this.s3Bucket) {
      await this.writeBlogEntryS3(entry, previousFileRef);
      return;
    }

    this.writeBlogEntryLocal(entry, previousFileRef);
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

  async getProjects() {
    await this.ensureInitialized();
    return Array.from(this.projects.values());
  }

  async getFeaturedProjects() {
    await this.ensureInitialized();
    return Array.from(this.projects.values()).filter((project) => project.featured === "true");
  }

  async getProject(id: string) {
    await this.ensureInitialized();
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject) {
    await this.ensureInitialized();
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async createContactMessage(insertMessage: InsertContactMessage) {
    const id = randomUUID();
    const message: ContactMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async getContactMessages() {
    return Array.from(this.contactMessages.values());
  }

  async getArticles() {
    await this.ensureInitialized();
    return Array.from(this.articles.values());
  }

  async getPublishedArticles() {
    await this.ensureInitialized();
    return Array.from(this.articles.values()).filter((article) => article.status === "published");
  }

  async getArticle(slug: string) {
    await this.ensureInitialized();
    return Array.from(this.articles.values()).find((article) => article.slug === slug);
  }

  async getPublishedArticle(slug: string) {
    await this.ensureInitialized();
    return Array.from(this.articles.values()).find(
      (article) => article.slug === slug && article.status === "published",
    );
  }

  async createArticle(insertArticle: InsertArticle) {
    await this.ensureInitialized();
    const id = randomUUID();
    const fileRecord: BlogEntryFile = {
      id,
      projectId: insertArticle.projectId,
      slug: this.ensureUniqueSlug(insertArticle.slug),
      title: insertArticle.title,
      status: insertArticle.status,
      excerpt: insertArticle.excerpt,
      content: insertArticle.content,
      imageUrl: insertArticle.imageUrl || "",
      deployedUrl: insertArticle.deployedUrl || "",
      githubUrl: insertArticle.githubUrl || "",
      publishedDate: insertArticle.publishedDate,
    };

    await this.persistBlogEntry(fileRecord);
    const article = this.toArticle(fileRecord);
    this.storeArticleInMemory(article, this.articleFiles.get(id)!);
    return article;
  }

  async updateArticle(id: string, insertArticle: InsertArticle) {
    await this.ensureInitialized();
    const existing = this.articles.get(id);
    if (!existing) {
      return undefined;
    }

    const fileRecord: BlogEntryFile = {
      id,
      projectId: insertArticle.projectId,
      slug: this.ensureUniqueSlug(insertArticle.slug, id),
      title: insertArticle.title,
      status: insertArticle.status,
      excerpt: insertArticle.excerpt,
      content: insertArticle.content,
      imageUrl: insertArticle.imageUrl || "",
      deployedUrl: insertArticle.deployedUrl || "",
      githubUrl: insertArticle.githubUrl || "",
      publishedDate: insertArticle.publishedDate,
    };

    const previousFileRef = this.articleFiles.get(id);
    await this.persistBlogEntry(fileRecord, previousFileRef);
    const updated = this.toArticle(fileRecord);
    this.storeArticleInMemory(updated, this.articleFiles.get(id)!);
    return updated;
  }

  async saveBlogImage(file: { buffer: Buffer; mimeType: string; originalName: string }) {
    await this.ensureInitialized();
    const extension = path.extname(file.originalName || "").toLowerCase() || ".png";
    const safeBase =
      path
        .basename(file.originalName || "image", extension)
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "image";
    const filename = `${Date.now()}-${safeBase}${extension}`;

    if (this.storageBackend === "s3" && this.s3Client && this.s3Bucket) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: this.s3ImageKey(filename),
          Body: file.buffer,
          ContentType: file.mimeType || inferContentType(filename),
        }),
      );
    } else {
      this.ensureLocalDirectories();
      fs.writeFileSync(path.join(this.blogImagesDir, filename), file.buffer);
    }

    return {
      alt: path.basename(file.originalName, path.extname(file.originalName || "")) || "diagram",
      path: `/content/blog_entries/img/${filename}`,
    };
  }

  async getBlogImage(filename: string) {
    await this.ensureInitialized();

    if (this.storageBackend === "s3" && this.s3Client && this.s3Bucket) {
      return this.readS3ObjectBuffer(this.s3ImageKey(filename));
    }

    const filePath = path.join(this.blogImagesDir, filename);
    if (!fs.existsSync(filePath)) {
      return undefined;
    }

    return {
      body: fs.readFileSync(filePath),
      contentType: inferContentType(filename),
    };
  }

  async saveResume(file: { buffer: Buffer; mimeType: string; originalName: string }) {
    await this.ensureInitialized();
    const filename = "israel-soto-resume.pdf";
    const updatedAt = new Date().toISOString();

    if (this.storageBackend === "s3" && this.s3Client && this.s3Bucket) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: this.s3ResumeKey(),
          Body: file.buffer,
          ContentType: file.mimeType || "application/pdf",
          Metadata: {
            originalname: file.originalName,
            updatedat: updatedAt,
          },
        }),
      );
    } else {
      this.ensureLocalDirectories();
      fs.writeFileSync(path.join(this.resumeDir, filename), file.buffer);
    }

    return {
      filename,
      updatedAt,
      size: file.buffer.length,
    };
  }

  async getResume() {
    await this.ensureInitialized();

    if (this.storageBackend === "s3" && this.s3Client && this.s3Bucket) {
      return this.readS3File(this.s3ResumeKey(), "israel-soto-resume.pdf");
    }

    this.ensureLocalDirectories();
    const localPath = path.join(this.resumeDir, "israel-soto-resume.pdf");
    if (fs.existsSync(localPath)) {
      return {
        body: fs.readFileSync(localPath),
        contentType: "application/pdf",
        filename: "israel-soto-resume.pdf",
      };
    }

    const bundledResumePath = path.join(process.cwd(), "attached_assets", "Israel_Soto_Resume_1756754540992.pdf");
    if (fs.existsSync(bundledResumePath)) {
      return {
        body: fs.readFileSync(bundledResumePath),
        contentType: "application/pdf",
        filename: "israel-soto-resume.pdf",
      };
    }

    return undefined;
  }

  async getResumeInfo() {
    await this.ensureInitialized();

    if (this.storageBackend === "s3" && this.s3Client && this.s3Bucket) {
      try {
        const response = await this.s3Client.send(
          new HeadObjectCommand({
            Bucket: this.s3Bucket,
            Key: this.s3ResumeKey(),
          }),
        );

        return {
          filename: "israel-soto-resume.pdf",
          updatedAt: response.LastModified?.toISOString() || new Date().toISOString(),
          size: response.ContentLength || 0,
        };
      } catch {
        return null;
      }
    }

    this.ensureLocalDirectories();
    const localPath = path.join(this.resumeDir, "israel-soto-resume.pdf");
    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      return {
        filename: "israel-soto-resume.pdf",
        updatedAt: stats.mtime.toISOString(),
        size: stats.size,
      };
    }

    const bundledResumePath = path.join(process.cwd(), "attached_assets", "Israel_Soto_Resume_1756754540992.pdf");
    if (fs.existsSync(bundledResumePath)) {
      const stats = fs.statSync(bundledResumePath);
      return {
        filename: "israel-soto-resume.pdf",
        updatedAt: stats.mtime.toISOString(),
        size: stats.size,
      };
    }

    return null;
  }
}

export const storage = new MemStorage();

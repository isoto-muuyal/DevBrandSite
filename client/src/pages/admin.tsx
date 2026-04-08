import { type ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { type Article } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type AnalyticsEvent = {
  type: "visit" | "interaction" | "download";
  ip: string;
  location: string;
  page: string;
  target?: string;
  timestamp: string;
};

type TargetCount = {
  target: string;
  count: number;
};

type Report = {
  uniqueVisits: number;
  totalVisits: number;
  totalInteractions: number;
  resumeDownloads: number;
  topTargets: TargetCount[];
  events: AnalyticsEvent[];
  files: {
    uniqueCountFile: string;
    visitLogFile: string;
  };
};

type EditableEntry = Pick<
  Article,
  "id" | "projectId" | "title" | "slug" | "status" | "excerpt" | "content" | "publishedDate" | "imageUrl" | "deployedUrl" | "githubUrl"
>;

function toEditableEntry(article: Article): EditableEntry {
  return {
    id: article.id,
    projectId: article.projectId,
    title: article.title,
    slug: article.slug,
    status: article.status,
    excerpt: article.excerpt,
    content: article.content,
    publishedDate: article.publishedDate,
    imageUrl: article.imageUrl || "",
    deployedUrl: article.deployedUrl || "",
    githubUrl: article.githubUrl || "",
  };
}

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [entries, setEntries] = useState<Article[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string>("");
  const [draft, setDraft] = useState<EditableEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"analytics" | "blog">("analytics");
  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) || null,
    [entries, selectedEntryId],
  );

  const loadAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const reportRes = await fetch("/api/admin/report", { credentials: "include" });
      if (reportRes.status === 401) {
        setReport(null);
        setEntries([]);
        setSelectedEntryId("");
        setDraft(null);
        return;
      }
      if (!reportRes.ok) {
        const message = await reportRes.text();
        throw new Error(message || "Failed to load admin report");
      }

      const entriesRes = await fetch("/api/admin/blog-entries", { credentials: "include" });
      if (!entriesRes.ok) {
        const message = await entriesRes.text();
        throw new Error(message || "Failed to load blog entries");
      }

      const reportData = (await reportRes.json()) as Report;
      const entryData = (await entriesRes.json()) as Article[];

      setReport(reportData);
      setEntries(entryData);
      if (entryData.length > 0) {
        setSelectedEntryId((current) =>
          current && entryData.some((entry) => entry.id === current) ? current : entryData[0].id,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin page");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  useEffect(() => {
    if (selectedEntry) {
      setDraft(toEditableEntry(selectedEntry));
    }
  }, [selectedEntry]);

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await apiRequest("POST", "/api/admin/login", { username, password });
      setUsername("");
      setPassword("");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const onLogout = async () => {
    await apiRequest("POST", "/api/admin/logout");
    setReport(null);
    setEntries([]);
    setSelectedEntryId("");
    setDraft(null);
    setSaveMessage("");
  };

  const onSaveEntry = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft) {
      return;
    }

    setSaving(true);
    setSaveMessage("");
    setError("");

    try {
      const response = await apiRequest("PUT", `/api/admin/blog-entries/${draft.id}`, {
        projectId: draft.projectId,
        title: draft.title,
        slug: draft.slug,
        status: draft.status,
        excerpt: draft.excerpt,
        content: draft.content,
        tags: [],
        publishedDate: draft.publishedDate,
        readTime: "1 min read",
        imageUrl: draft.imageUrl,
        deployedUrl: draft.deployedUrl,
        githubUrl: draft.githubUrl,
      });

      const updated = (await response.json()) as Article;
      setEntries((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      setSelectedEntryId(updated.id);
      setDraft(toEditableEntry(updated));
      setSaveMessage("Blog entry saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save blog entry");
    } finally {
      setSaving(false);
    }
  };

  const onAddEntry = async () => {
    setSaving(true);
    setSaveMessage("");
    setError("");

    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const response = await apiRequest("POST", "/api/admin/blog-entries", {
        projectId: "",
        title: "New Blog Entry",
        slug: `new-blog-entry-${Date.now()}`,
        status: "unpublished",
        excerpt: "Add a short summary for this blog entry.",
        content: "Write the full article here.",
        tags: [],
        publishedDate: timestamp,
        readTime: "1 min read",
        imageUrl: "",
        deployedUrl: "",
        githubUrl: "",
      });

      const created = (await response.json()) as Article;
      setEntries((current) => [created, ...current]);
      setSelectedEntryId(created.id);
      setDraft(toEditableEntry(created));
      setActiveTab("blog");
      setSaveMessage("New blog entry created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create blog entry");
    } finally {
      setSaving(false);
    }
  };

  const onUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !draft) {
      return;
    }

    setUploadingImage(true);
    setSaveMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/blog-images", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to upload image");
      }

      const data = (await response.json()) as { path: string; alt: string };
      const imageMarkup = `![${data.alt}](${data.path})`;
      const textarea = contentTextareaRef.current;

      if (textarea) {
        const start = textarea.selectionStart ?? draft.content.length;
        const end = textarea.selectionEnd ?? draft.content.length;
        const prefix = draft.content.slice(0, start);
        const suffix = draft.content.slice(end);
        const separatorBefore = prefix.endsWith("\n") || prefix.length === 0 ? "" : "\n\n";
        const separatorAfter = suffix.startsWith("\n") || suffix.length === 0 ? "" : "\n\n";
        const nextContent = `${prefix}${separatorBefore}${imageMarkup}${separatorAfter}${suffix}`;
        setDraft({ ...draft, content: nextContent });
      } else {
        setDraft({ ...draft, content: `${draft.content}\n\n${imageMarkup}`.trim() });
      }

      setSaveMessage("Image uploaded and inserted into the body.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      event.target.value = "";
      setUploadingImage(false);
    }
  };

  const onUploadCoverImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !draft) {
      return;
    }

    setUploadingCoverImage(true);
    setSaveMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/blog-images", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to upload cover image");
      }

      const data = (await response.json()) as { path: string };
      setDraft({ ...draft, imageUrl: data.path });
      setSaveMessage("Cover image uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload cover image");
    } finally {
      event.target.value = "";
      setUploadingCoverImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 text-gray-900">
        <div className="mx-auto max-w-6xl">Loading admin page...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-white p-6 text-gray-900">
        <div className="mx-auto max-w-md rounded-lg border border-gray-300 p-6 shadow-sm">
          <h1 className="mb-4 text-2xl font-semibold">Admin Login</h1>
          <form className="space-y-3" onSubmit={onLogin} data-analytics-ignore="true">
            <input
              className="w-full rounded border border-gray-300 px-3 py-2"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              className="w-full rounded border border-gray-300 px-3 py-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="w-full rounded bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700"
              type="submit"
            >
              Sign in
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 text-gray-900" data-analytics-ignore="true">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Admin</h1>
            <p className="text-sm text-gray-500">Analytics and local blog entry management</p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => void onAddEntry()}
              type="button"
            >
              Add Blog Entry
            </button>
            <button
              className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
              onClick={() => void loadAdminData()}
              type="button"
            >
              Refresh
            </button>
            <button
              className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              activeTab === "analytics" ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("analytics")}
            type="button"
          >
            Analytics
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              activeTab === "blog" ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("blog")}
            type="button"
          >
            Blog Entries
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saveMessage && <p className="text-sm text-green-600">{saveMessage}</p>}

        {activeTab === "analytics" ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-gray-300 p-4">
                <p className="text-sm text-gray-500">Unique Visits</p>
                <p className="text-2xl font-semibold">{report.uniqueVisits}</p>
              </div>
              <div className="rounded-lg border border-gray-300 p-4">
                <p className="text-sm text-gray-500">Page Visits</p>
                <p className="text-2xl font-semibold">{report.totalVisits}</p>
              </div>
              <div className="rounded-lg border border-gray-300 p-4">
                <p className="text-sm text-gray-500">Button/Link Clicks</p>
                <p className="text-2xl font-semibold">{report.totalInteractions}</p>
              </div>
              <div className="rounded-lg border border-gray-300 p-4">
                <p className="text-sm text-gray-500">CV Downloads</p>
                <p className="text-2xl font-semibold">{report.resumeDownloads}</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr,1.9fr]">
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-300 p-4 text-sm">
                  <p>
                    <strong>Counter file:</strong> {report.files.uniqueCountFile}
                  </p>
                  <p>
                    <strong>Event log file:</strong> {report.files.visitLogFile}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-300 p-4">
                  <h2 className="mb-3 text-lg font-semibold">Top Clicked Targets</h2>
                  <div className="space-y-2 text-sm">
                    {report.topTargets.length === 0 ? (
                      <p className="text-gray-500">No interaction data yet.</p>
                    ) : (
                      report.topTargets.map((item) => (
                        <div key={item.target} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2">
                          <span className="truncate pr-3">{item.target}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-300">
                <table className="min-w-full divide-y divide-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Timestamp</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Page / Target</th>
                      <th className="px-3 py-2 text-left">IP</th>
                      <th className="px-3 py-2 text-left">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {report.events.map((analyticsEvent, index) => (
                      <tr key={`${analyticsEvent.timestamp}-${analyticsEvent.ip}-${index}`}>
                        <td className="whitespace-nowrap px-3 py-2">{analyticsEvent.timestamp}</td>
                        <td className="px-3 py-2 capitalize">{analyticsEvent.type}</td>
                        <td className="px-3 py-2">{analyticsEvent.page}</td>
                        <td className="whitespace-nowrap px-3 py-2">{analyticsEvent.ip}</td>
                        <td className="px-3 py-2">{analyticsEvent.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
            <div className="rounded-lg border border-gray-300">
              <div className="border-b border-gray-300 px-4 py-3">
                <h2 className="font-semibold">Entries</h2>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    className={`block w-full border-b border-gray-200 px-4 py-3 text-left last:border-b-0 ${
                      selectedEntryId === entry.id ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedEntryId(entry.id);
                      setSaveMessage("");
                    }}
                    type="button"
                  >
                    <p className="font-medium">{entry.title}</p>
                    <p className="text-sm text-gray-500">{entry.slug}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-300 p-6">
              {draft ? (
                <form className="space-y-4" onSubmit={onSaveEntry}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">{draft.title || "Untitled Post"}</h2>
                      <p className="text-sm text-gray-500">{draft.slug}</p>
                    </div>
                    <label className="flex items-center gap-3 text-sm">
                      <span className="font-medium text-gray-600">
                        {draft.status === "published" ? "Published" : "Unpublished"}
                      </span>
                      <button
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          draft.status === "published" ? "bg-green-600" : "bg-gray-300"
                        }`}
                        onClick={() =>
                          setDraft({
                            ...draft,
                            status: draft.status === "published" ? "unpublished" : "published",
                          })
                        }
                        type="button"
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            draft.status === "published" ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm">
                      <span className="font-medium">Project ID</span>
                      <input
                        className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-50"
                        value={draft.projectId}
                        readOnly
                      />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="font-medium">Published Date</span>
                      <input
                        className="w-full rounded border border-gray-300 px-3 py-2"
                        type="date"
                        value={draft.publishedDate}
                        onChange={(e) => setDraft({ ...draft, publishedDate: e.target.value })}
                      />
                    </label>
                  </div>

                  <label className="block space-y-1 text-sm">
                    <span className="font-medium">Title</span>
                    <input
                      className="w-full rounded border border-gray-300 px-3 py-2"
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      required
                    />
                  </label>

                  <label className="block space-y-1 text-sm">
                    <span className="font-medium">Slug</span>
                    <input
                      className="w-full rounded border border-gray-300 px-3 py-2"
                      value={draft.slug}
                      onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                      required
                    />
                  </label>

                  <label className="block space-y-1 text-sm">
                    <span className="font-medium">Excerpt</span>
                    <textarea
                      className="min-h-24 w-full rounded border border-gray-300 px-3 py-2"
                      value={draft.excerpt}
                      onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                      required
                    />
                  </label>

                  <label className="block space-y-1 text-sm">
                    <span className="font-medium">Body</span>
                    <textarea
                      ref={contentTextareaRef}
                      className="min-h-64 w-full rounded border border-gray-300 px-3 py-2"
                      value={draft.content}
                      onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                      required
                    />
                  </label>

                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">Inline images</p>
                        <p className="text-gray-500">
                          Upload diagrams to store them in `blog_entries/img` and insert them into the body where the cursor is.
                        </p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center rounded border border-gray-300 bg-white px-3 py-2 hover:bg-gray-100">
                        <span>{uploadingImage ? "Uploading..." : "Upload Image"}</span>
                        <input
                          className="hidden"
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={onUploadImage}
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-gray-500">
                      Images use markdown syntax like `![diagram](/content/blog_entries/img/file.png)`.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm">
                      <span className="font-medium">Deployed URL</span>
                      <input
                        className="w-full rounded border border-gray-300 px-3 py-2"
                        type="url"
                        value={draft.deployedUrl}
                        onChange={(e) => setDraft({ ...draft, deployedUrl: e.target.value })}
                      />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="font-medium">GitHub URL</span>
                      <input
                        className="w-full rounded border border-gray-300 px-3 py-2"
                        type="url"
                        value={draft.githubUrl}
                        onChange={(e) => setDraft({ ...draft, githubUrl: e.target.value })}
                      />
                    </label>
                  </div>

                  <label className="block space-y-1 text-sm">
                    <span className="font-medium">Image URL</span>
                    <input
                      className="w-full rounded border border-gray-300 px-3 py-2"
                      type="text"
                      value={draft.imageUrl}
                      onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
                    />
                  </label>
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">Cover image upload</p>
                        <p className="text-gray-500">
                          Upload a local image to store it in `blog_entries/img` and fill the Image URL field automatically.
                        </p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center rounded border border-gray-300 bg-white px-3 py-2 hover:bg-gray-100">
                        <span>{uploadingCoverImage ? "Uploading..." : "Upload Cover Image"}</span>
                        <input
                          className="hidden"
                          type="file"
                          accept="image/*"
                          disabled={uploadingCoverImage}
                          onChange={onUploadCoverImage}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={saving}
                      type="submit"
                    >
                      {saving ? "Saving..." : "Save Entry"}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-500">Select a blog entry to edit.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

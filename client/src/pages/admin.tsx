import { FormEvent, useEffect, useState } from "react";
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

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/report", { credentials: "include" });
      if (res.status === 401) {
        setReport(null);
        return;
      }
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to load report");
      }
      const data = (await res.json()) as Report;
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, []);

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await apiRequest("POST", "/api/admin/login", { username, password });
      setUsername("");
      setPassword("");
      await loadReport();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const onLogout = async () => {
    await apiRequest("POST", "/api/admin/logout");
    setReport(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 text-gray-900">
        <div className="mx-auto max-w-5xl">Loading admin report...</div>
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
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Admin Report</h1>
          <button
            className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
        </div>

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
                {report.events.map((event, index) => (
                  <tr key={`${event.timestamp}-${event.ip}-${index}`}>
                    <td className="whitespace-nowrap px-3 py-2">{event.timestamp}</td>
                    <td className="px-3 py-2 capitalize">{event.type}</td>
                    <td className="px-3 py-2">{event.page}</td>
                    <td className="whitespace-nowrap px-3 py-2">{event.ip}</td>
                    <td className="px-3 py-2">{event.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

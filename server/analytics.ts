import fs from "fs";
import path from "path";

export type AnalyticsEventType = "visit" | "interaction" | "download";

export type AnalyticsEvent = {
  type: AnalyticsEventType;
  ip: string;
  location: string;
  page: string;
  target?: string;
  timestamp: string;
};

type LegacyVisitEntry = {
  ip: string;
  location: string;
  page: string;
  timestamp: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const UNIQUE_COUNT_FILE = path.join(DATA_DIR, "unique_visit_count.txt");
const VISIT_LOG_FILE = path.join(DATA_DIR, "visit_details.log");

let initialized = false;
let uniqueIps = new Set<string>();

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(UNIQUE_COUNT_FILE)) {
    fs.writeFileSync(UNIQUE_COUNT_FILE, "0\n", "utf8");
  }

  if (!fs.existsSync(VISIT_LOG_FILE)) {
    fs.writeFileSync(VISIT_LOG_FILE, "", "utf8");
  }
}

function normalizeEvent(input: Partial<AnalyticsEvent> | LegacyVisitEntry): AnalyticsEvent | null {
  if (!input.ip || !input.page || !input.timestamp) {
    return null;
  }

  const type = input.type === "interaction" || input.type === "download" ? input.type : "visit";

  return {
    type,
    ip: input.ip,
    location: input.location || "unknown",
    page: input.page,
    target: input.target,
    timestamp: input.timestamp,
  };
}

function readAllEvents(): AnalyticsEvent[] {
  const raw = fs.readFileSync(VISIT_LOG_FILE, "utf8");
  const events: AnalyticsEvent[] = [];

  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line) as Partial<AnalyticsEvent> | LegacyVisitEntry;
      const event = normalizeEvent(parsed);
      if (event) {
        events.push(event);
      }
    } catch {
      // Ignore malformed log lines.
    }
  }

  return events;
}

function rebuildUniqueIps(events: AnalyticsEvent[]) {
  uniqueIps = new Set(events.filter((event) => event.type === "visit").map((event) => event.ip));
  fs.writeFileSync(UNIQUE_COUNT_FILE, `${uniqueIps.size}\n`, "utf8");
}

function initialize() {
  if (initialized) return;
  ensureFiles();
  rebuildUniqueIps(readAllEvents());
  initialized = true;
}

function countTargets(events: AnalyticsEvent[]) {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (!event.target) continue;
    counts.set(event.target, (counts.get(event.target) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([target, count]) => ({ target, count }))
    .sort((a, b) => b.count - a.count);
}

export function recordEvent(event: AnalyticsEvent) {
  initialize();

  let isUnique = false;
  if (event.type === "visit" && !uniqueIps.has(event.ip)) {
    uniqueIps.add(event.ip);
    isUnique = true;
    fs.writeFileSync(UNIQUE_COUNT_FILE, `${uniqueIps.size}\n`, "utf8");
  }

  fs.appendFileSync(VISIT_LOG_FILE, `${JSON.stringify(event)}\n`, "utf8");

  return {
    isUnique,
    uniqueVisits: uniqueIps.size,
  };
}

export function getUniqueVisitCount() {
  initialize();
  return uniqueIps.size;
}

export function getAnalyticsReport(limit = 300) {
  initialize();
  const events = readAllEvents();
  const visitEvents = events.filter((event) => event.type === "visit");
  const interactionEvents = events.filter((event) => event.type === "interaction");
  const downloadEvents = events.filter((event) => event.type === "download");

  return {
    uniqueVisits: uniqueIps.size,
    totalVisits: visitEvents.length,
    totalInteractions: interactionEvents.length,
    resumeDownloads: downloadEvents.filter((event) => event.target === "resume-download").length,
    topTargets: countTargets([...interactionEvents, ...downloadEvents]).slice(0, 20),
    events: events.slice(-limit).reverse(),
    files: {
      uniqueCountFile: UNIQUE_COUNT_FILE,
      visitLogFile: VISIT_LOG_FILE,
    },
  };
}

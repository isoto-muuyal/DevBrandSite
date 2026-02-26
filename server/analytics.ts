import fs from "fs";
import path from "path";

export type VisitEntry = {
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

function parseExistingLogs() {
  const raw = fs.readFileSync(VISIT_LOG_FILE, "utf8");
  if (!raw.trim()) {
    uniqueIps = new Set<string>();
    fs.writeFileSync(UNIQUE_COUNT_FILE, "0\n", "utf8");
    return;
  }

  const nextUniqueIps = new Set<string>();
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line) as Partial<VisitEntry>;
      if (parsed.ip) {
        nextUniqueIps.add(parsed.ip);
      }
    } catch {
      // Ignore malformed log lines.
    }
  }

  uniqueIps = nextUniqueIps;
  fs.writeFileSync(UNIQUE_COUNT_FILE, `${uniqueIps.size}\n`, "utf8");
}

function initialize() {
  if (initialized) return;
  ensureFiles();
  parseExistingLogs();
  initialized = true;
}

export function recordVisit(entry: VisitEntry) {
  initialize();

  const isUnique = !uniqueIps.has(entry.ip);
  if (isUnique) {
    uniqueIps.add(entry.ip);
    fs.writeFileSync(UNIQUE_COUNT_FILE, `${uniqueIps.size}\n`, "utf8");
  }

  fs.appendFileSync(VISIT_LOG_FILE, `${JSON.stringify(entry)}\n`, "utf8");

  return {
    isUnique,
    uniqueVisits: uniqueIps.size,
  };
}

export function getUniqueVisitCount() {
  initialize();
  return uniqueIps.size;
}

export function getVisitReport(limit = 200) {
  initialize();
  const raw = fs.readFileSync(VISIT_LOG_FILE, "utf8");
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const visits: VisitEntry[] = [];
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as VisitEntry;
      visits.push(parsed);
    } catch {
      // Ignore malformed log lines.
    }
  }

  return {
    uniqueVisits: uniqueIps.size,
    totalVisits: visits.length,
    visits: visits.slice(-limit).reverse(),
    files: {
      uniqueCountFile: UNIQUE_COUNT_FILE,
      visitLogFile: VISIT_LOG_FILE,
    },
  };
}


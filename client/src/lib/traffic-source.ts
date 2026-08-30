const STORAGE_KEY = "traffic_source_v1";

export type TrafficParams = {
  referrer: string;
  utmSource: string;
};

export function getTrafficParams(): TrafficParams {
  if (typeof window === "undefined") {
    return { referrer: "", utmSource: "" };
  }

  const stored = window.sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as TrafficParams;
    } catch {
      // fall through and recompute
    }
  }

  const params = new URLSearchParams(window.location.search);
  const trafficParams: TrafficParams = {
    referrer: document.referrer || "",
    utmSource: params.get("utm_source") || "",
  };

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trafficParams));
  return trafficParams;
}

import { useEffect } from "react";
import { useLocation } from "wouter";

export default function VisitTracker() {
  const [location] = useLocation();

  useEffect(() => {
    void fetch("/api/visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ page: location }),
    }).catch(() => {
      // Do not block page rendering when tracking fails.
    });
  }, [location]);

  return null;
}


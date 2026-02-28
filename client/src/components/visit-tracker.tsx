import { useEffect } from "react";
import { useLocation } from "wouter";

function getTargetName(element: HTMLElement) {
  const testId = element.getAttribute("data-testid");
  if (testId) return testId;

  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel.trim();

  const text = element.textContent?.trim();
  if (text) return text.slice(0, 80);

  return element.tagName.toLowerCase();
}

function track(url: string, payload: Record<string, string>) {
  void fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }).catch(() => {
    // Tracking should never block UI interactions.
  });
}

export default function VisitTracker() {
  const [location] = useLocation();

  useEffect(() => {
    track("/api/visit", { page: location });
  }, [location]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const clickable = target.closest("button, a, [role='button']");
      if (!(clickable instanceof HTMLElement)) return;
      if (clickable.closest("[data-analytics-ignore='true']")) return;

      track("/api/interaction", {
        page: location,
        target: getTargetName(clickable),
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [location]);

  return null;
}

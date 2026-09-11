"use client";

export type TelemetryType =
  | "page_view"
  | "product_view"
  | "scroll_depth"
  | "page_engagement"
  | "add_to_cart"
  | "remove_from_cart"
  | "cart_quantity"
  | "checkout_start"
  | "order_created";

const VISITOR_KEY = "eurofoam-visitor-v1";
const SESSION_KEY = "eurofoam-session-v1";
const SESSION_TIMEOUT = 30 * 60 * 1000;

function id(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function visitorId() {
  if (typeof window === "undefined") return "";

  let existing = localStorage.getItem(VISITOR_KEY);

  if (!existing) {
    existing = id("visitor");
    localStorage.setItem(VISITOR_KEY, existing);
  }

  return existing;
}

export function sessionId() {
  if (typeof window === "undefined") return "";

  const now = Date.now();

  try {
    const raw = localStorage.getItem(SESSION_KEY);

    if (raw) {
      const current = JSON.parse(raw) as {
        id: string;
        lastActivity: number;
      };

      if (
        current.id &&
        now - current.lastActivity < SESSION_TIMEOUT
      ) {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            ...current,
            lastActivity: now
          })
        );

        return current.id;
      }
    }
  } catch {}

  const next = id("session");

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      id: next,
      lastActivity: now
    })
  );

  return next;
}

function device() {
  if (typeof window === "undefined") return "unknown";

  if (window.innerWidth < 640) return "mobile";
  if (window.innerWidth < 1024) return "tablet";

  return "desktop";
}

export async function trackEvent(
  type: TelemetryType,
  extra: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") return;

  if (navigator.doNotTrack === "1") return;

  const params = new URLSearchParams(window.location.search);

  let referrer = "";

  try {
    if (document.referrer) {
      const url = new URL(document.referrer);
      referrer = url.hostname;
    }
  } catch {}

  try {
    await fetch("/api/telemetry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      keepalive: true,
      body: JSON.stringify({
        type,
        visitorId: visitorId(),
        sessionId: sessionId(),
        path: window.location.pathname,
        title: document.title,
        device: device(),
        viewportWidth: window.innerWidth,
        language: navigator.language,
        referrer,
        utmSource: params.get("utm_source") || "",
        utmMedium: params.get("utm_medium") || "",
        utmCampaign: params.get("utm_campaign") || "",
        ...extra
      })
    });
  } catch {}
}

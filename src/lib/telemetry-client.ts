"use client";

/*
  First-party analytics. Runs ONLY after the visitor allows "Improve the
  site" in the cookie choices (see ConsentProvider). Before that, and for
  anyone sending Global Privacy Control / Do Not Track, every call here
  is a no-op and no identifier is stored.

  Events go to /api/telemetry on our own domain — no third parties.
*/

export type TelemetryType =
  | "page_view"
  | "product_view"
  | "scroll_depth"
  | "page_engagement"
  | "add_to_cart"
  | "remove_from_cart"
  | "cart_quantity"
  | "cart_open"
  | "checkout_start"
  | "checkout_step"
  | "order_created"
  | "pincode_check"
  | "quiz_complete"
  | "search"
  | "wishlist_add";

const VISITOR_KEY = "eurofoam-visitor-v1";
const SESSION_KEY = "eurofoam-session-v1";
const SESSION_TIMEOUT = 30 * 60 * 1000;

let allowed = false;

export function setAnalyticsAllowed(value: boolean) {
  allowed = value;
}

function privacySignal() {
  return (
    typeof navigator !== "undefined" &&
    (navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true)
  );
}

function id(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function visitorId() {
  let existing = localStorage.getItem(VISITOR_KEY);
  if (!existing) {
    existing = id("visitor");
    localStorage.setItem(VISITOR_KEY, existing);
  }
  return existing;
}

function sessionId() {
  const now = Date.now();
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const current = JSON.parse(raw) as { id: string; lastActivity: number };
      if (current.id && now - current.lastActivity < SESSION_TIMEOUT) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, lastActivity: now }));
        return current.id;
      }
    }
  } catch {}
  const next = id("session");
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: next, lastActivity: now }));
  return next;
}

function device() {
  if (window.innerWidth < 640) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}

export function trackEvent(type: TelemetryType, extra: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !allowed || privacySignal()) return;

  try {
    const params = new URLSearchParams(window.location.search);
    let referrer = "";
    try {
      if (document.referrer) {
        const url = new URL(document.referrer);
        if (url.host !== window.location.host) referrer = url.hostname;
      }
    } catch {}

    const body = JSON.stringify({
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
      ...extra,
    });

    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/telemetry", blob)) {
      void fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body,
      }).catch(() => {});
    }
  } catch {}
}

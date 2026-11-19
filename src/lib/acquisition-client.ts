"use client";
import type { Acquisition } from "@/lib/acquisition";
const KEY = "gadda-acquisition-session";
export function rememberAcquisition(allowed: boolean) {
  if (!allowed || typeof window === "undefined") return;
  try {
    const p = new URLSearchParams(location.search);
    const source = p.get("utm_source") || (p.has("gclid") ? "google" : p.has("fbclid") ? "meta" : "");
    const campaign = p.get("utm_campaign") || "";
    if (!source && !campaign) return;
    const first: Acquisition = {
      source, medium: p.get("utm_medium") || "", campaign,
      content: p.get("utm_content") || "", term: p.get("utm_term") || "",
      landing: location.pathname, referrer: document.referrer ? new URL(document.referrer).hostname : "",
    };
    if (!sessionStorage.getItem(KEY)) sessionStorage.setItem(KEY, JSON.stringify(first));
  } catch { /* privacy settings may block sessionStorage */ }
}
export function getAcquisition(allowed: boolean): Acquisition | undefined {
  if (!allowed || typeof window === "undefined") return undefined;
  try { const s = sessionStorage.getItem(KEY); return s ? JSON.parse(s) as Acquisition : undefined; }
  catch { return undefined; }
}

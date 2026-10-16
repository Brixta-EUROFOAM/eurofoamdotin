import { NextResponse } from "next/server";
import { publicOrigin } from "@/lib/public-url";

/*
  Small, dependency-free request guards shared by every API route.
  The site runs as a single container, so in-memory limits are enough;
  move to Postgres/Redis if you ever run more than one instance.
*/

export function clientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

/* Sliding-window limiter. Returns true when the call is allowed. */
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  if (now - lastSweep > 60_000) {
    for (const [k, hits] of buckets) {
      if (!hits.length || now - hits[hits.length - 1] > 60 * 60_000) buckets.delete(k);
    }
    lastSweep = now;
  }
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

export function tooMany(message = "Too many requests. Please wait a minute and try again.") {
  return NextResponse.json({ error: message }, { status: 429, headers: { "Retry-After": "60" } });
}

/*
  CSRF defence for cookie-authenticated POSTs: browsers always send Origin
  on cross-site POSTs, so reject any that don't come from this site.
  (SameSite=Lax cookies already block most of this; this closes the rest.)
*/
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    // Non-browser clients (curl, server-to-server). Fetch Metadata if present:
    const site = request.headers.get("sec-fetch-site");
    return !site || site === "same-origin" || site === "none";
  }
  try {
    const o = new URL(origin);
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    if (o.host === host) return true;
    const configured = publicOrigin();
    return configured ? o.origin === configured : false;
  } catch {
    return false;
  }
}

export function forbidden() {
  return NextResponse.json({ error: "Request blocked." }, { status: 403 });
}

/* Parse a JSON body with a hard size cap (default 16 KB). */
export async function readJson<T = Record<string, unknown>>(request: Request, maxBytes = 16_384): Promise<T | null> {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxBytes) return null;
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

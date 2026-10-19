import { NextResponse, type NextRequest } from "next/server";

/*
  Runs before every page and API request (Next 16 "proxy", formerly
  middleware). Two jobs:

  1. Content-Security-Policy with a fresh nonce per request. Next reads
     the nonce from the request's CSP header and stamps it on its own
     <script> tags; anything injected (XSS) without the nonce won't run.
  2. CSRF wall for the API: any state-changing request must come from
     this site's own pages.
*/

const isDev = process.env.NODE_ENV !== "production";

function csp(nonce: string) {
  const gtm = Boolean(process.env.NEXT_PUBLIC_GTM_ID);
  const meta = Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID);

  const connect = ["'self'"];
  if (gtm) connect.push("https://*.google-analytics.com", "https://*.analytics.google.com", "https://*.googletagmanager.com");
  if (meta) connect.push("https://www.facebook.com", "https://connect.facebook.net");
  if (isDev) connect.push("ws:", "wss:");

  const frames = ["'self'", "https://www.youtube-nocookie.com"]; // size-guide video
  if (gtm) frames.push("https://www.googletagmanager.com");

  return [
    `default-src 'self'`,
    // 'strict-dynamic' lets nonce'd scripts load their own children (tag managers);
    // https: is only a fallback for very old browsers that ignore strict-dynamic.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:${isDev ? " 'unsafe-eval'" : ""}`,
    // React style={{}} attributes need this; styles can't execute code.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src ${connect.join(" ")}`,
    `frame-src ${frames.join(" ")}`,
    `media-src 'self' https:`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    isDev ? "" : "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function crossSite(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return true;
  if (!origin) return false;
  try {
    const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host");
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (!SAFE_METHODS.has(request.method) && crossSite(request)) {
      return NextResponse.json({ error: "Request blocked." }, { status: 403 });
    }
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Robots-Tag", "noindex");
    return res;
  }

  const nonce = btoa(crypto.randomUUID());
  const policy = csp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", policy);
  if (pathname.startsWith("/admin") || pathname.startsWith("/ops")) {
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|robots.txt|sitemap.xml|media/|fonts/|layers/|home/|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|woff2?|ttf)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

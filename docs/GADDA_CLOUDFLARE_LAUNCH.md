# GADDA Cloudflare release checklist (2026-11-20)

These settings **ARE NOT AUTOMATICALLY APPLIED BY THE REPO PATCH**. A Cloudflare zone administrator must apply them in the Dashboard. Do not claim the historical 525/530/403/429 are resolved without new logs.

## 1 — Tunnel and TLS (highest priority)

In Cloudflare Zero Trust / Networks / Tunnels, find the tunnel and public hostname `gadda.store`.
- When `cloudflared` runs on the Docker **host** on which docker-compose publishes `127.0.0.1:3700:3000`, the service should usually be `http://localhost:3700`. NOT `https://localhost:3700`, because this Next.js container listens over HTTP.
- If `cloudflared` runs inside another container, `localhost` refers to that container, not the Docker host. Supply a reachable service name on the shared network or appropriate host gateway instead.
- Confirm `gadda.store` routes to the correct tunnel and that tunnel connectors are healthy. A 530/1033 often means the tunnel route cannot find a healthy connector, not an origin certificate mismatch.
- If a separate reverse proxy or TLS origin is used, inspect its valid certificate and SSL/TLS configuration instead of assuming an HTTP tunnel route.
- Never weaken TLS security globally or enable insecure SSL verification as a quick workaround.

On the server:
```bash
docker compose ps
curl -I http://127.0.0.1:3700/
curl -sS -o /dev/null -w '%{http_code} %{time_total}s\n' http://127.0.0.1:3700/health  # 404 is OK if no health endpoint
```
In Cloudflare Analytics / Security Events filter 525 and 530 by hostname, Ray ID, time, URL and confirm the exact failure type.

## 2 — High-confidence exploit-scanner block rule

Cloudflare > Security > WAF > Custom Rules, expression:
```text
(http.host in {"gadda.store" "www.gadda.store"} and
 (http.request.uri.path eq "/wp-login.php" or
  http.request.uri.path eq "/wp-admin" or
  starts_with(http.request.uri.path, "/wp-admin/") or
  http.request.uri.path eq "/.env" or
  starts_with(http.request.uri.path, "/.env.") or
  http.request.uri.path eq "/phpinfo.php" or
  ends_with(http.request.uri.path, ".cgi")))
```
Use Block for verified exploit probes. Do NOT block whole countries, users with blank user agent, or all `/api/*`. Razorpay POST `/api/payments/razorpay` needs to remain reachable. Review bot/managed-challenge hits before introducing stronger protections.

## 3 — Cache immutable Next.js assets ONLY

Caching > Cache Rules > Create rule:
```text
(http.host eq "gadda.store" and starts_with(http.request.uri.path, "/_next/static/"))
```
Set cache eligibility **Eligible for cache**, Edge TTL **Respect origin cache-control** (Next.js normally sets a 1-year immutable lifetime for hashed assets); optionally use 1-year edge TTL only after validating the response header. Do not cache HTML, `/api`, `/checkout`, `/account`, `/admin`, cart, customer-specific pages or payment endpoints. Inspect two separate requests to the same static JS URL: after warm-up expect CF-Cache-Status HIT where eligible.

## 4 — WWW to apex redirect at the edge

DNS: create a proxied `www` record/route that allows Cloudflare to receive the request. Rules > Redirect Rules > Single Redirect.
- Filter: `http.host eq "www.gadda.store"`
- Dynamic target: `concat("https://gadda.store", http.request.uri.path)`
- Preserve query string: ON; HTTP status: 301

Application middleware has a backup 308 redirect; the Cloudflare rule is more efficient. Ensure TLS/DNS for the www name is functional before testing.

## 5 — 403/429 review

Use Cloudflare Security Events: filter response/action by `www`, `/mattresses`, `/account`, `/checkout`, `/api/create-order`, `/api/verify-payment`, `/api/payments/razorpay`, and suspected user ASN/Ray ID. App-side 403 can come from `src/proxy.ts` / `sameOrigin()`; app-side 429 from rate limits. Inspect representative Ray IDs and origin logs before changing thresholds. Keep strong protection on auth and payment routes.

## 6 — Cloudflare Web Analytics

Either use automatic injection in Cloudflare OR the optional code beacon via `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN`; **do not enable both**, to avoid duplicates. This code beacon requires analytics consent. Configure the token on the production environment **at build time** because it is `NEXT_PUBLIC_`. CSP permits the Cloudflare endpoint when token is set. Cloudflare Web Analytics is not automatically a source of identified CRM leads.

## 7 — Smoke tests (after deployment)

```bash
curl -sS -I https://gadda.store/
curl -sS -I 'https://www.gadda.store/compare?utm_source=test'
curl -sS -I https://gadda.store/sitemap.xml
curl -sS -I https://gadda.store/robots.txt
curl -sS -I -X POST https://gadda.store/api/payments/razorpay -H 'Content-Type: application/json' -d '{}'
```
Unauthenticated webhook probe should fail **400 Bad signature**, not a Cloudflare 525/530, site-wide 403 or 404. Never post a real webhook secret or API key to a public tool.

Reference docs: Cloudflare Tunnel public hostnames, WAF Custom Rules, Cache Rules, Single Redirects, Web Analytics; Razorpay webhook guide. This document is an operator checklist, not evidence that edge settings are active.

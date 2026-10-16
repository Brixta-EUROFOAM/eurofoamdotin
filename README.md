# GADDA Mattresses — D2C storefront (v6)

Next.js 16 storefront + built-in admin for GADDA (UMADUTT INDUSTRIES).
Patterns borrowed from the best Indian mattress D2C sites — announcement
ticker, PIN-code delivery dates, slide-out cart, sticky mobile dock, mega
menu, comparison table, quiz, trust strip, FAQ with rich results — rebuilt in
GADDA's own honest, no-jargon voice. No fake MRPs, countdowns or reviews.

## Run

```bash
npm install
cp .env.example .env.local   # fill in the secrets
npm run dev
```

Deploy as before: `docker compose build && docker compose up -d`.

## Before going live — fill these in

`src/lib/business.ts` — legal details the law requires on the site
(registered address, manufacturer address, GSTIN, Grievance Officer name +
email, warranty years per product, size dimensions). Missing ones are hidden
on the site and listed on **/admin/orders**.

Admin → phone and email: the WhatsApp button, call links and contact page
only appear once a real number/email is set.

`src/lib/delivery.ts` — delivery-time zones by PIN prefix. Keep them honest.

`src/lib/policies.tsx` — Terms, Privacy, Cookies, Delivery, Trial, Refunds,
Warranty, Grievance. Drafted against the Consumer Protection (E-Commerce)
Rules 2020, CCPA Dark Patterns Guidelines 2023 and the DPDP Act 2023 /
Rules 2025. **Have a lawyer read them once.**

## Environment

| Variable | Needed | What for |
|---|---|---|
| `ADMIN_SESSION_SECRET` | yes | Signs admin sessions (32+ random chars) |
| `CUSTOMER_SESSION_SECRET` | yes | Signs customer sessions — **login fails without it** |
| `PUBLIC_SITE_URL` | yes | e.g. `https://eurofoam.in` — canonical URLs, sitemap, CSRF |
| `NEXT_PUBLIC_GTM_ID` | no | Google Tag Manager, loads only after "Ads and offers" consent (build-time) |
| `NEXT_PUBLIC_META_PIXEL_ID` | no | Meta Pixel, same rule (build-time) |

## How the important bits work

- **Consent** (`src/components/store/ConsentProvider.tsx`) — opt-in banner,
  equal-weight Accept/Reject, per-purpose toggles, honours Global Privacy
  Control / DNT, re-askable from the footer, consent receipts logged to
  `data/consent.jsonl`. Analytics and ad tags don't run until allowed.
- **Telemetry** — first-party only (`/api/telemetry` → `data/telemetry.jsonl`),
  consent-gated on client *and* server, auto-pruned after 13 months.
- **Location** — the visitor types a PIN code (never GPS). `/api/pincode`
  returns serviceability + delivery window from our zone table and the
  city/state from India Post. Stored in the `gd_pin` cookie.
- **Cart** — localStorage cart, slide-out drawer, live re-pricing from the
  server (`/api/quote`); orders are always re-priced server-side.
- **Checkout** — 3 steps, PIN autofill, explicit Terms checkbox (not
  pre-ticked), optional WhatsApp-updates opt-in, idempotency key against
  double orders. Pay on delivery or UPI link.
- **Customer rights** — account page: order history, download my data,
  delete my account.
- **Security** — per-request CSP nonce + CSRF wall (`src/proxy.ts`), HSTS,
  frame/sniff/referrer/permissions headers (`next.config.ts`), rate limits
  and body-size caps on every API, constant-time login, strict admin cookies,
  magic-byte image upload checks, CSV-injection-safe exports, hardened
  container (`docker-compose.yml`).
- **SEO** — Organization, WebSite, Product, FAQ, Breadcrumb JSON-LD;
  `sitemap.xml`, `robots.txt`, per-page metadata.

## Admin exports

On **/admin/orders**: orders, call-back requests, newsletter sign-ups and
consent receipts as CSV.

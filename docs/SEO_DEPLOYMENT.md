# GADDA SEO / AEO deployment

This installation is designed for the existing Next.js storefront and does not modify checkout, secrets, payment verification, or catalogue pricing.

## Before production

1. Confirm `PUBLIC_SITE_URL=https://eurofoam.in` on the production host. Use the canonical origin that serves the storefront.
2. Edit `src/lib/local-seo.ts`: enter a **genuine**, verifiable physical location only if one exists and is eligible for a Google Business Profile. Do not invent a Guwahati showroom, street address, postal code, business hours, or geographic coordinates. Add verified social/profile URLs to `sameAs`.
3. Fill out missing facts in `src/lib/business.ts` (registered and manufacturing addresses, GSTIN, grievance officer, and confirmed warranty periods) and the real phone/email in the Admin store configuration.
4. Reconcile `src/lib/delivery.ts` (`DISPATCH_FROM = "Silchar, Assam"`) with the ex-factory Byrnihat basis. Do not promise 24–48-hour delivery without transporter evidence. Confirm the actual PIN-zone SLAs.
5. Verify trial, shipping, availability, free returns, and warranty terms against the published policies. The existing Product JSON-LD currently reports `InStock`, `shippingRate: 0` and a free returns policy—confirm these claims before deployment.
6. Confirm hero technology claims from engineering data. This site does NOT invent EdgeLock™, zero-glue construction, reinforced edges, an inspection zipper or any patent/trademark.
7. Audit images with `node scripts/audit-media.mjs`. Review all image alt attributes visually; convert suitable photographic assets to WebP/AVIF and ensure sensible dimensions/lazy loading for below-the-fold images.

## Local verification

```bash
npx next typegen
npx tsc --noEmit
npm run dev
# In a second terminal:
node scripts/verify-seo.mjs http://localhost:3000
node scripts/audit-media.mjs
```

Validate deployed HTML in the official Google Rich Results Test, [Schema Markup Validator](https://validator.schema.org/), and Google Search Console URL Inspection. The `/llms.txt` and `/llms-full.txt` endpoints are dynamic; do not also create `public/llms.txt` files, or they will conflict with the Next.js routes.

## Google Maps and local discovery (manual external actions)

Google Business Profile is separate from on-site SEO. Set up/claim and verify the profile only for a genuinely eligible, staffed location or service-area operation with permitted face-to-face customer contact. Select the accurate primary category (for example, Mattress store if the business genuinely qualifies), complete the real phone/address/areas, add original product/store photos, verify website URL, and request genuine customer reviews without incentives. A web page and schema alone **cannot create a Maps listing or guarantee a map-pack ranking**.

## Measurement

Set up Google Search Console for the domain property; submit `https://eurofoam.in/sitemap.xml`; inspect `/mattresses/guwahati` and all product pages. Monitor impressions, click-through rate and nonbrand queries such as "mattress guwahati", "queen size mattress guwahati", "high density foam mattress assam". For Maps, use Business Profile Performance calls/directions/website clicks where available. For AI answer visibility, periodically test citations manually; `llms.txt` is optional and does not guarantee indexing or citations.

## What the architecture supplies

- Dynamic crawl policy, sitemap with file/database-backed catalogue modification dates (other routes omit unverifiable modification dates)
- Dynamic `/llms.txt`, `/llms-full.txt` from the live catalogue and FAQs
- Organization + website graph; LocalBusiness only after valid physical address details
- Product and FAQ schema plus breadcrumb schema already in the storefront
- Semantic Guwahati landing page and server-rendered direct answers and comparison checklist
- Updated defaults for title, description, OpenGraph, Twitter, canonical, image descriptions
- Runtime validation and source-media audit scripts

Note: Google commonly restricts FAQ rich results to authoritative government/health sites; FAQ markup may still help machine understanding without a special search result display.

# GADDA release testing

1. `npx tsc --noEmit && npm run build && git diff --check` locally (after installing dependencies).
2. Confirm SEO canonical host `https://gadda.store` in page metadata, sitemap and robots; `PUBLIC_SITE_URL=https://gadda.store` on the production server.
3. Verify 308 backup redirect for `https://www.gadda.store/...`, plus Cloudflare 301 edge redirect with query preserved.
4. Verify a fully anonymous quiz taker can skip email and see their recommendation; opting in saves a subscriber and has the consent text.
5. Test signed-in Buy again: previously purchased items appear in cart, review fresh server-side pricing at checkout. No automatic charge.
6. Check product, cart and checkout trial-policy links and ensure policy claims match the actual legal terms.
7. With marketing consent and **test** Razorpay keys, verify NO Meta Purchase event is emitted. With valid live keys and a controlled actual paid transaction, verify ONE Purchase event from browser and no event for COD, canceled or failed payment. Ensure GTM doesn't duplicate Meta Pixel events. Ad blockers may prevent delivery.
8. Cloudflare Web Analytics beacon: use one injection method and verify CSP / consent handling.
9. Enter manual ad spend in /admin/roas using UTM campaign names. The report is directional, not auditable platform-level ROAS. Avoid overlapping date ranges and review refunds.
10. Verify Brevo notification delivery (provider acceptance != mailbox delivery), webhook event signature and no duplicated payment messages.
11. Apply the separate docs/GADDA_CLOUDFLARE_LAUNCH.md dashboard checklist and inspect actual error logs.
12. After passing tests, push to GitHub and deploy the built image on the actual production host. GitHub Actions success alone does not update Docker running containers.
13. Meta Lead Ads, Google lead forms, ad-spend OAuth, Google Merchant Center inventory/feed and paid-media setup require separate external account authorization. No credentials or permissions are invented by this patch.

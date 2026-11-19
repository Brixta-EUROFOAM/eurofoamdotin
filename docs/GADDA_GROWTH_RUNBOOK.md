# GADDA growth operations — launch checklist

## Emails
1. Create a Brevo account and verify `gadda.store` sending domain (SPF/DKIM). Confirm `admin@eurofoam.in` receives mail.
2. In the production Docker host `.env`, set `BREVO_API_KEY`, `GADDA_ALERT_FROM`, `GADDA_ALERT_TO`.
3. Never commit keys. `.env*` is already ignored. `docker compose up -d --build --force-recreate`.
4. Place one test pay-on-delivery order and one callback enquiry, then make a test Razorpay payment.
5. Confirm distinct order-created (unpaid vs COD) and Razorpay-captured alerts. Check logs if email fails.
6. Email outbox records are created before sending. Definitive Brevo HTTP rejections can be retried at `/admin/crm`. Uncertain network outcomes require checking Brevo logs to avoid a duplicate. `Accepted` means Brevo accepted the API request, not delivery. Do not treat email as the order ledger.

## Acquisition
- Use UTM tags on paid ads (for example `?utm_source=meta&utm_medium=paid_social&utm_campaign=guwahati_test`).
- UTM capture for an identifiable order/enquiry requires visitor marketing consent. Without consent the CRM labels `unattributed`.
- The internal CRM at `/admin/crm` includes website leads/orders. External Instagram/Google leads still require a separate OAuth/API integration or CSV import.
- ROAS = verified paid revenue attributed to ads / actual ad spend. Order-created, abandoned checkout, and COD orders are NOT paid revenue.

## Cloudflare dashboard — apply separately (these are not code changes)
- Confirm 525 origin TLS handshake using origin logs and Cloudflare Ray IDs. Use Full (strict) only with a valid public/Cloudflare Origin CA certificate for the host; verify tunnel upstream settings. 530 can have distinct causes and should not be assumed SSL.
- Create a WAF custom rule targeting obvious exploit paths ONLY, not countries, blank user agents, or every `.env` substring. Start with Log/Managed Challenge; review false positives. For high-confidence probes `/wp-login.php`, `/wp-admin`, `/.env`, `/phpinfo.php`, `.cgi` consider Block. Exclude legitimate Cloudflare and app challenge endpoints.
- Cache `/ _next/static/` assets (without space) with edge TTL ~1 year only for content-hashed immutable assets; never cache checkout, cart, account, auth, API or HTML dynamically.
- Set a 301 redirect `www.gadda.store` -> `gadda.store` preserving path/query; ensure TLS works for both hosts.
- Inspect firewall events by URI, action, ASN and Ray ID before changing rate limits. Some 403/429 may be legitimate abuse protection.
- Turn on Cloudflare Web Analytics through the Dashboard and check privacy/CSP. Do not confuse Cloudflare requests with human sessions.

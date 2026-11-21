# GADDA delivery policy scope

**Ship only to:** All of **Assam, including Guwahati**, and all of **Meghalaya**.

This patch removes other Northeast states and all other Indian states from the
storefront delivery eligibility check. It also blocks direct order-creation POSTs
with PINs outside the permitted ranges. This is not a promise that a carrier
actually serves every valid post office in these two states.

## Eligible postal sorting ranges
- Assam (incl. Guwahati): `78xxxx` (with `788xxx` keeping the existing Barak Valley ETA).
- Meghalaya: `793xxx` and `794xxx`.
- Some Meghalaya border post offices share 78-prefixed PINs; those remain accepted.
- Other prefixes (e.g. 791 / 795 / 796 / 797 / 798 / 799 / 110 / 700) are rejected.

**Important:** PIN prefix alone does not prove a specific PIN exists. The
`/api/pincode` route makes a best-effort postal lookup to enrich city/state and
reject a conflicting state. If the external lookup fails, prefix eligibility
remains an estimate. Confirm carrier coverage, prices, weight limits and actual
transit time before making a delivery guarantee. The retained **1–3 days for
Barak Valley** and **3–6 days for other Assam/Meghalaya** are OLD estimates,
not newly verified service-level agreements.

## Must-test after deploy

1. `/api/pincode?pin=781001` → eligible (Guwahati).
2. `/api/pincode?pin=788001` → eligible (Silchar).
3. `/api/pincode?pin=793001` → eligible (Shillong).
4. `/api/pincode?pin=794001` → eligible (Tura).
5. `/api/pincode?pin=791001` → not eligible (Arunachal Pradesh).
6. `/api/pincode?pin=795001` → not eligible (Manipur).
7. `/api/pincode?pin=799001` → not eligible (Tripura).
8. `/api/pincode?pin=110001` → not eligible (Delhi).
9. Checkout must require completed PIN verification, and direct API order POST
   from a disallowed PIN must return 422 without saving an order or opening Razorpay.
10. If the previous Live Intent patch is installed, test the hero PIN checker
    and delivery-gap enquiry; an unserviceable PIN may still create an *enquiry*
    after the visitor voluntarily supplies contact details, never an order.

This change does not alter existing orders, payments, Brevo configuration or
Cloudflare settings. Redeploy the web app after applying it. Confirm coverage
with your actual transport partner, particularly for remote Meghalaya districts.

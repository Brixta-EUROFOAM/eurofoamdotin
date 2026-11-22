"use client";

/** Minimal, allowlisted GA4 event bridge; never pass raw telemetry to Google. */
const ID = "G-S5YGN608LE";
const DIRECT_GA4 = process.env.NEXT_PUBLIC_ENABLE_GTM !== "true";
const safeSlug = (v: unknown) => typeof v === "string" && /^[a-z0-9-]{1,80}$/.test(v) ? v : "";
const positive = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v > 0 ? v : undefined;

export function trackGa4Interaction(type: string, extra: Record<string, unknown>) {
  if (typeof window === "undefined" || !DIRECT_GA4 || typeof window.gtag !== "function") return;
  if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true) return;
  const slug = safeSlug(extra.productSlug || extra.slug);
  const value = positive(extra.value);
  const count = positive(extra.itemCount);
  switch (type) {
    case "product_view":
      if (slug) window.gtag("event", "view_item", { send_to: ID, items: [{ item_id: slug, item_name: slug }] });
      break;
    case "add_to_cart":
      window.gtag("event", "add_to_cart", { send_to: ID, ...(slug ? { items: [{ item_id: slug, item_name: slug }] } : {}), ...(value ? { value, currency: "INR" } : {}) });
      break;
    case "checkout_start":
      window.gtag("event", "begin_checkout", { send_to: ID, ...(value ? { value, currency: "INR" } : {}), ...(count ? { item_count: count } : {}) });
      break;
    case "quiz_start":
    case "quiz_complete":
      window.gtag("event", type, { send_to: ID });
      break;
    case "pincode_check":
      window.gtag("event", "delivery_pincode_check", { send_to: ID, serviceable: extra.ok === true });
      break;
  }
}

/** Only after a successful, server-verified, non-test Razorpay payment. */
export function trackVerifiedGa4Purchase(orderId: string, amount: number, consent: boolean) {
  if (!consent || typeof window === "undefined" || !DIRECT_GA4 || typeof window.gtag !== "function") return;
  if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true) return;
  if (!/^GD-[A-Za-z0-9-]+$/.test(orderId) || !Number.isFinite(amount) || amount <= 0) return;
  const key = `gadda-ga4-purchase-${orderId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch { return; }
  window.gtag("event", "purchase", {
    send_to: ID, transaction_id: orderId, value: amount, currency: "INR",
  });
}

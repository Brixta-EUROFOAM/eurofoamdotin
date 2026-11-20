"use client";

/** Browser ad-platform events only after Razorpay confirmation and marketing consent. */
type ConversionWindow = Window & { fbq?: (...args: unknown[]) => void; dataLayer?: unknown[] };
export function recordVerifiedPurchase(orderId: string, amount: number, consent: boolean) {
  if (!consent || typeof window === "undefined" || !/^GD-[A-Za-z0-9-]+$/.test(orderId)) return;
  if (!Number.isFinite(amount) || amount <= 0) return;
  const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (privacy.globalPrivacyControl === true || navigator.doNotTrack === "1") return;
  const w = window as ConversionWindow;
  if (typeof w.fbq !== "function" && !Array.isArray(w.dataLayer)) return;
  const marker = `gadda-verified-conversion-${orderId}`;
  try {
    if (sessionStorage.getItem(marker)) return;
    // Mark before dispatch to reduce duplicate client-side events on retries.
    sessionStorage.setItem(marker, "1");
  } catch { return; }
  const payload = { transaction_id: orderId, value: amount, currency: "INR" };
  try {
    if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event: "purchase", ecommerce: payload, ...payload });
    // Configure GTM so it DOES NOT fire a second Pixel Purchase for this event.
    if (typeof w.fbq === "function") w.fbq("track", "Purchase", { value: amount, currency: "INR" }, { eventID: orderId });
  } catch { /* ad blockers and consent extensions may prevent dispatch */ }
}

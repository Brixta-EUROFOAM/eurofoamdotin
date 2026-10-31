import { BUSINESS } from "@/lib/business";

/*
  FAQ answers can link to any page: write [link text](/page), e.g.
  "Take the [60-second quiz](/sleep-quiz)". Admin → FAQs edits these.

  Shared copy for the storefront. Plain words, no mattress jargon —
  if a line can't be backed up, it doesn't go here.
*/

/* "How do I pay?": two ways when online payment is on, one when it's off (see Faq.tsx) */
export const PAY_QUESTION = "How do I pay?";
export const OLD_PAY_ANSWER =
  "Pay on delivery (cash or UPI when it arrives), or ask for a secure UPI payment link after we confirm your order. We never ask for card details on the phone.";
export function payAnswer(online: boolean) {
  return online
    ? "Two ways: pay online at checkout (UPI, card or net banking, on Razorpay's secure page), or pay on delivery (cash or UPI when it arrives). We never ask for card details on the phone."
    : "Pay on delivery: cash or UPI when it arrives. We never ask for card details on the phone.";
}

export const FAQS: { q: string; a: string; group: "buying" | "delivery" | "trial" | "product" }[] = [
  {
    group: "product",
    q: "Which GADDA should I get?",
    a: "Regular if you like it firm and want the best price. Pro if you want firm support with a softer top — it suits most people. Ultimate if you like a plush, sink-in-a-little feel. Not sure? The [60-second quiz](/sleep-quiz) picks one for you.",
  },
  {
    group: "trial",
    q: `How does the ${BUSINESS.trialNights}-night trial work?`,
    a: `Sleep on it at home. Give it at least 30 nights — your back needs a few weeks to adjust to any new mattress. If you still don't love it before night ${BUSINESS.trialNights}, tell us and we arrange pickup and refund you. The full terms are on the [trial page](/policies/trial).`,
  },
  {
    group: "delivery",
    q: "How long does delivery take, and what does it cost?",
    a: "Delivery is included in the price. Enter your PIN code on any [mattress page](/mattresses) for a delivery window — usually 1–3 days around Silchar, up to about 12 days for the rest of India. We call before dispatch to fix a time.",
  },
  {
    group: "buying",
    q: "How do I pay?",
    a: payAnswer(true),
  },
  {
    group: "buying",
    q: "Why is there no 'MRP' slashed to 70% off?",
    a: "Because that MRP would be made up. The price you see is the price — everyone pays the same, every day, inclusive of GST.",
  },
  {
    group: "product",
    q: "Do you make custom sizes?",
    a: "Single, Double, Queen and King are on the site in 6 and 8 inch heights. For an odd-sized bed, call or WhatsApp us with the measurements and we'll tell you what's possible.",
  },
  {
    group: "product",
    q: "Is there a warranty?",
    a: "Yes, every GADDA has a manufacturer warranty against defects like permanent sagging or broken foam. What's covered and how to claim is on the [warranty page](/policies/warranty).",
  },
  {
    group: "delivery",
    q: "Will the mattress come rolled up in a box?",
    a: "No — it comes flat, the way a mattress should, wrapped in protective plastic. Unwrap it and sleep the same night.",
  },
];

export const TRUST = [
  { id: "trial", title: `${BUSINESS.trialNights} nights to decide`, body: "Try it at home, not in a showroom", href: "/policies/trial" },
  { id: "delivery", title: "Delivery included", body: "To your door, anywhere in India", href: "/policies/shipping" },
  { id: "price", title: "One honest price", body: "No fake MRP, no 'sale' countdowns", href: "/why-gadda" },
  { id: "pay", title: "Pay on delivery", body: "Cash or UPI when it arrives", href: "/policies/terms#payment" },
] as const;

/* layer colours, matched to the layer photos (public/products/…) */
export const LAYER_SWATCH: Record<string, string> = {
  fabric: "#8c8b8d",
  foam: "#e9dbb9",
  memory: "#ece9e2",
  latex: "#efe2b8",
  hr: "#8f8e8b",
  hd: "#b9b8b5",
  spring: "#dcd8cf",
  zoned: "#8f8e8b",
  core: "#8f8e8b",
  cool: "#d9e3dd",
  adaptive: "#e2d5bb",
  auto: "#e6e1d8",
};
const DENSEST = "#4d4b48"; // 40-density HR foam is charcoal in the photos

export function swatchFor(kind?: string, name = "") {
  if (/\b40\s*d\b/i.test(name) && (kind === "hr" || /\bhr\b/i.test(name))) return DENSEST;
  if (kind && kind !== "auto" && LAYER_SWATCH[kind]) return LAYER_SWATCH[kind];
  const n = name.toLowerCase();
  if (n.includes("cover") || n.includes("fabric")) return LAYER_SWATCH.fabric;
  if (n.includes("spring")) return LAYER_SWATCH.spring;
  if (n.includes("memory")) return LAYER_SWATCH.memory;
  if (n.includes("latex")) return LAYER_SWATCH.latex;
  if (n.includes("hr")) return LAYER_SWATCH.hr;
  if (n.includes("hd") || n.includes("base")) return LAYER_SWATCH.hd;
  return LAYER_SWATCH.foam;
}

import type { SiteSettings } from "@/lib/catalog";

/*
  Every editable line on the homepage. Admin → Homepage text shows these
  fields; anything left empty falls back to the default here.
*/

export type CopyField = { key: string; label: string; def: string; long?: boolean };
export type CopyGroup = { title: string; fields: CopyField[] };

export const HOME_COPY: CopyGroup[] = [
  {
    title: "Top of the page",
    fields: [
      { key: "heroLede", label: "Paragraph under the headline", long: true, def: "It's a Mattress not a rocket. No made-up discounts. No confusing jargon. Just thoughtfully built foam mattresses, honestly priced and delivered to your door." },
      { key: "heroFrom", label: "Price line (use {price})", def: "From {price}, GST and delivery included." },
    ],
  },
  {
    title: "Ad banners strip",
    fields: [{ key: "promosTitle", label: "Heading above banners (optional)", def: "" }],
  },
  {
    title: "The range",
    fields: [
      { key: "rangeTitle", label: "Heading", def: "Three mattresses. That's the whole range." },
      { key: "rangeHindi", label: "Hindi note", def: "बस तीन" },
      { key: "rangeLede", label: "Paragraph", long: true, def: "Firm, balanced or plush. Every size in 6 or 8 inch, priced the same for everyone, every day." },
      { key: "rangePick", label: "Badge on the featured mattress", def: "Our pick for most people" },
      { key: "rangeCompare", label: "Compare button", def: "Compare side by side" },
    ],
  },
  {
    title: "Usual mattress vs GADDA",
    fields: [
      { key: "vsTitle", label: "Heading", def: "Buying a mattress shouldn't need a glossary." },
      { key: "vsHindi", label: "Hindi note", def: "सीधी बात" },
      { key: "vsLede", label: "Paragraph", long: true, def: "Most of the words on a mattress label are there to justify the price tag. Here's the difference." },
      { key: "vsThemTitle", label: "Left column title", def: "The usual mattress" },
      { key: "vsThem1", label: "Left point 1", def: "An “MRP” that nobody pays, slashed by 60% forever" },
      { key: "vsThem2", label: "Left point 2", def: "Trademarked names for ordinary foam" },
      { key: "vsThem3", label: "Left point 3", def: "A sale countdown that resets at midnight" },
      { key: "vsUsTitle", label: "Right column title", def: "A GADDA" },
      { key: "vsUs1", label: "Right point 1", def: "Every layer named, in plain words" },
      { key: "vsUs1Sub", label: "Right point 1 — detail", def: "Cover, comfort foam, support foam. Density printed where we know it." },
      { key: "vsUs2", label: "Right point 2", def: "One price, the real one" },
      { key: "vsUs2Sub", label: "Right point 2 — detail", def: "Including GST and delivery. No coupons needed to get a fair deal." },
      { key: "vsUs3", label: "Right point 3", def: "Made in India, sold direct" },
      { key: "vsUs3Sub", label: "Right point 3 — detail", def: "No showroom rent or middlemen added to what you pay." },
      { key: "vsCta", label: "Button", def: "Why we do it this way" },
    ],
  },
  {
    title: "How buying works",
    fields: [
      { key: "howTitle", label: "Heading", def: "How buying a GADDA works" },
      { key: "howHindi", label: "Hindi note", def: "आराम से" },
      { key: "howLede", label: "Paragraph", def: "No payment gateway hoops. Order online, and a person takes it from there." },
      { key: "how1", label: "Step 1", def: "Pick size and height" },
      { key: "how1Sub", label: "Step 1 — detail", def: "Order online in two minutes. No payment needed on the site." },
      { key: "how2", label: "Step 2", def: "We call to confirm" },
      { key: "how2Sub", label: "Step 2 — detail", def: "A real person checks your size, address and a delivery time that suits you." },
      { key: "how3", label: "Step 3", def: "It arrives flat" },
      { key: "how3Sub", label: "Step 3 — detail", def: "Delivered to your door. Pay on delivery, or by UPI link if you prefer." },
      { key: "how4", label: "Step 4 (use {trial})", def: "{trial} nights to decide" },
      { key: "how4Sub", label: "Step 4 — detail", def: "Not right for you? We pick it up and refund you." },
    ],
  },
  {
    title: "Help choosing",
    fields: [
      { key: "quizTitle", label: "Quiz panel title", def: "Not sure which one?" },
      { key: "quizBody", label: "Quiz panel text", long: true, def: "Five quick questions about how you sleep. We'll point you to one mattress, with the reason." },
      { key: "quizCta", label: "Quiz button", def: "Take the 60-second quiz" },
      { key: "compareTitle", label: "Compare panel title", def: "See all three side by side" },
      { key: "compareBody", label: "Compare panel text", long: true, def: "Layers, feel, heights and prices in one table. No marketing words." },
      { key: "compareCta", label: "Compare button", def: "Compare mattresses" },
    ],
  },
];

const DEFAULTS = new Map(HOME_COPY.flatMap((g) => g.fields.map((f) => [f.key, f.def] as const)));

/* Text for a key: the admin's version if set, else the default; {tokens} filled in. */
export function copyText(site: SiteSettings, key: string, vars: Record<string, string | number> = {}) {
  const raw = site.copy?.[key]?.trim() || DEFAULTS.get(key) || "";
  return raw.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

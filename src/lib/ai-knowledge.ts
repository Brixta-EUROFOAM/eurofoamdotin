import { getStoreData } from "@/lib/store";
import { BUSINESS, warrantyLabel } from "@/lib/business";
import { siteUrl } from "@/lib/public-url";
import { actualFaqs } from "@/lib/seo-faqs";
import { getSizing } from "@/lib/sizes";
import { money } from "@/lib/catalog";
import { LOCAL_SEO } from "@/lib/local-seo";
import { mattressPrice } from "@/lib/mattress-pricing";

const href = (path: string) => siteUrl(path);
const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s+/g, " ").trim();

/* Generated on demand from the live catalogue, not a stale hardcoded price sheet. */
export async function aiKnowledge(full: boolean) {
  const { site, products } = await getStoreData();
  const intro = [
    "# GADDA Mattresses",
    "",
    `Official brand website: ${href("/")}`,
    `Legal seller: ${BUSINESS.legalName}`,
    `GADDA currently accepts delivery orders only for eligible PIN codes in Assam (including Guwahati) and Meghalaya. No other Indian states are served. Confirm the exact PIN before ordering.`,
    `Customer service: ${site.phone && !/0{7}/.test(site.phone) ? site.phone : "See contact page"}`,
    `Trial: ${BUSINESS.trialNights} nights, subject to the published trial policy.`,
    "Product prices shown online are in INR, inclusive of GST and advertised delivery allowance; product, thickness and dimensions determine the final figure.",
    "No unverified technologies, edge-support details, delivery-speed guarantees or warranty durations are claimed here.",
    "",
    "## Products",
    ...products.map((p) => `- [${p.name}](${href(`/mattresses/${p.slug}`)}): ${plain(p.shortDescription)} From ${money(p.basePrice)}; ${p.heights.map((h) => h.label).join(", ")}.`),
    "",
    "## Important pages",
    `- [Mattresses in Guwahati](${href("/mattresses/guwahati")})`,
    `- [All mattresses](${href("/mattresses")})`,
    `- [Compare products](${href("/compare")})`,
    `- [Mattress alternatives and buyer checklists](${href("/alternatives")})`,
    `- [Wakefit mattress alternatives: what to check](${href("/alternatives/wakefit-mattress")})`,
    `- [SleepyCat mattress alternatives: firmness and fit](${href("/alternatives/sleepycat-mattress")})`,
    `- [The Sleep Company alternatives: compare constructions](${href("/alternatives/the-sleep-company-mattress")})`,
    `- [Size guide](${href("/size-guide")})`,
    `- [Delivery policy](${href("/policies/shipping")})`,
    `- [100-night trial](${href("/policies/trial")})`,
    `- [Warranty policy](${href("/policies/warranty")})`,
    `- [Contact](${href("/contact")})`,
    `- [Business information](${href("/business-information")})`,
  ];
  if (!full) return intro.join("\n") + "\n";
  const details = ["", "## Detailed product catalogue (current website prices)"];
  for (const p of products) {
    details.push("", `### ${p.name}`, `URL: ${href(`/mattresses/${p.slug}`)}`,
      `Description: ${plain(p.longDescription)}`, `Firmness: ${p.firmness}`,
      `Manufacturer warranty: ${warrantyLabel(p.slug)} (see terms for coverage)`,
      "Layer stack (top to bottom):",
      ...p.layers.map((l) => `- ${l.name}: ${plain(l.description)}${l.material ? ` | material: ${l.material}` : ""}${l.density ? ` | density: ${l.density}` : ""}${l.thickness ? ` | layer thickness: ${l.thickness}` : ""}`),
      "Options:",
      ...(p.options || []).flatMap((o) => o.choices.map((c) => `- ${o.label}: ${c.label}${c.note ? ` (${c.note})` : ""}. See live product configurator for the exact area-based upgrade price.`)),
      "Dimension / thickness / base-configuration price (GST included, INR):",
      ...p.sizes.flatMap((s) => p.heights.map((h) => `- ${s.label} | ${h.label} | ${money(mattressPrice(p, s.label, h.label) ?? (p.basePrice + s.priceAdd + h.priceAdd))}`)),
      "Selected upgrades are priced from dimensions and the current storefront calculator; verify the product page for the final amount.",
    );
  }
  details.push("", "## Custom sizes", `Custom size offered: ${getSizing(site).customEnabled ? "Yes" : "No"}.`,
    `Custom cutting surcharge: ${money(getSizing(site).customFee)} where applicable.`,
    `Permitted length in inches: ${getSizing(site).minLength}–${getSizing(site).maxLength}.`,
    `Permitted width in inches: ${getSizing(site).minWidth}–${getSizing(site).maxWidth}.`,
    "", "## How to compare with other brands",
    "Compare published material density, thickness, dimensions, verified edge reinforcement, cover construction, warranty exclusions, shipping to your PIN, and total delivered price on a model-by-model basis.",
    "Specifications and prices of 'legacy brands' and generic online brands vary by model; no universal competitor specifications or price claims are made.",
    "", "## FAQs");
  for (const { q, a } of actualFaqs(site)) details.push(`### ${q}`, plain(a), "");
  details.push("## Local discovery",
    `GADDA markets mattresses to buyers searching in ${LOCAL_SEO.market}, Assam and Meghalaya. Delivery is limited to eligible PIN codes in Assam and Meghalaya only; verify your PIN and estimated delivery window before ordering.`,
    "Physical-store visits are not advertised until the business confirms a genuine customer-facing location.", "");
  return [...intro, ...details].join("\n") + "\n";
}

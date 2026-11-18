import type { Mattress } from "@/lib/catalog";
import { LENGTHS, SIZE_GROUPS, parseCustom } from "@/lib/sizes";

/* Prices are rupees. Factory prices and upgrades are ALREADY GST-inclusive.
   Delivery and payment-cost allowances are built into the visible selling price.
   Change these cost assumptions only after confirming actual carrier/gateway quotes.
   The exact same function is used by the browser and server checkout. */
const DELIVERY_PER_MATTRESS = 650.00;
const PACKING_PER_MATTRESS = 100.00;
const OTHER_PER_MATTRESS = 0.00;
const GATEWAY_COST_FRACTION = 0.023600; // percentage of customer charge; gross up, don't just add percent

const TIERS: Record<string, { baseInches: number; rate: number; extraTwoInches: number }> = {
  "gadda-regular": { baseInches: 6, rate: 277, extraTwoInches: 50 },
  "gadda-pro": { baseInches: 6, rate: 350, extraTwoInches: 70 },
  "gadda-ultimate": { baseInches: 8, rate: 550, extraTwoInches: 100 },
};

export function hasAreaPricing(slug: string) { return Boolean(TIERS[slug]); }

export function mattressPrice(
  p: Mattress, size: string, height: string, variant = "", customFee = 1000,
): number | null {
  const tier = TIERS[p.slug];
  if (!tier) return null;
  const normal = p.sizes.find((s) => s.label === size);
  const special = parseCustom(size);
  if (!normal && !special) return null;
  const length = normal?.length ?? special?.length;
  const width = normal?.width ?? special?.width;
  if (!length || !width || width > length || length < 24 || width < 24 || length > 120 || width > 120) return null;
  if (!p.heights.some((h) => h.label === height)) return null;
  const inches = Number(/^([0-9]+) inch$/.exec(height)?.[1]);
  if (!Number.isInteger(inches) || inches < tier.baseInches || (inches - tier.baseInches) % 2 !== 0) return null;

  const sqft = (length * width) / 144;
  let rate = tier.rate + ((inches - tier.baseInches) / 2) * tier.extraTwoInches;
  const chosen = variant.toLowerCase();
  if (p.slug === "gadda-pro" && /pocket springs/.test(chosen)) rate += 50;
  if (p.slug === "gadda-ultimate" && /latex/.test(chosen)) rate += 200;
  // Factory rates already include GST; do not apply GST again to the mattress.
  const factoryAndCosts = sqft * rate + DELIVERY_PER_MATTRESS + PACKING_PER_MATTRESS + OTHER_PER_MATTRESS +
    (special ? customFee : 0);
  // Gross-up: a 2.36% processing cost of the final charge needs division by 0.9764.
  return Math.ceil(factoryAndCosts / (1 - GATEWAY_COST_FRACTION));
}

/* Adapt the existing product data model for cards, size charts and SEO.
   This is a read-time normalization, so it also works with the existing database
   or a saved data/store.json; no database migration or price data reset. */
export function withAreaPricing(p: Mattress): Mattress {
  const tier = TIERS[p.slug];
  if (!tier) return p;
  const sizes = SIZE_GROUPS.flatMap((g) =>
    g.widths.flatMap((width) => LENGTHS.map((length) => ({
      label: `${g.id} ${length} × ${width} in`, group: g.id, length, width, priceAdd: 0,
    })))
  );
  const heights = [tier.baseInches, tier.baseInches + 2].map((n) => ({ label: `${n} inch`, priceAdd: 0 }));
  const source: Mattress = { ...p, sizes, heights };
  const referenceSize = sizes[0].label; // smallest standard size 72 × 30
  const referenceHeight = heights[0].label;
  const basePrice = mattressPrice(source, referenceSize, referenceHeight) ?? p.basePrice;
  return {
    ...source,
    basePrice,
    compareAt: basePrice, // no fabricated crossed-out discounts
    sizes: sizes.map((s) => ({ ...s, priceAdd: (mattressPrice(source, s.label, referenceHeight) ?? basePrice) - basePrice })),
    heights: heights.map((h) => ({ ...h, priceAdd: (mattressPrice(source, referenceSize, h.label) ?? basePrice) - basePrice })),
    options: p.options?.map((o) => ({ ...o, choices: o.choices.map((c) => ({
      ...c, priceAdd: (mattressPrice(source, referenceSize, referenceHeight, c.label) ?? basePrice) - basePrice,
    })) })),
  };
}

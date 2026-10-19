import type { Mattress, SiteSettings } from "@/lib/catalog";

/*
  Mattress sizes, Wakefit-style: a size GROUP (Single, Double, Queen, King),
  then an exact DIMENSION in inches (length × breadth), then thickness.
  Plus "Custom" — any size, priced as the next standard size up + a fee.

  Every product's sizes are editable in Admin → Products. Custom-size
  rules, the measuring guide and its video are in Admin → Sizes & guide.
*/

export type SizeRow = { label: string; priceAdd: number; group?: string; length?: number; width?: number };

export type SizeGroupInfo = { id: string; widths: number[]; fits: string; common: [number, number] };

export const SIZE_GROUPS: SizeGroupInfo[] = [
  { id: "Single", widths: [30, 35, 36], fits: "One person. Kids' rooms, hostels, guest beds.", common: [72, 36] },
  { id: "Double", widths: [42, 48], fits: "One adult who likes room to spread out, or two kids.", common: [72, 48] },
  { id: "Queen", widths: [60, 66], fits: "Two adults. The most common Indian double bed.", common: [75, 60] },
  { id: "King", widths: [72], fits: "Two adults who want space, or room for a child at night.", common: [78, 72] },
];
export const LENGTHS = [72, 75, 78];

export type Sizing = {
  customEnabled: boolean;
  customFee: number;
  minLength: number;
  maxLength: number;
  minWidth: number;
  maxWidth: number;
  videoUrl?: string; // optional "how to measure" video (YouTube/MP4 link)
  measureSteps: string[];
  fitNote: string;
};

export const DEFAULT_SIZING: Sizing = {
  customEnabled: true,
  customFee: 1000,
  minLength: 60,
  maxLength: 84,
  minWidth: 24,
  maxWidth: 84,
  videoUrl: "",
  measureSteps: [
    "Measure the INSIDE of your bed frame — wood to wood — not your old mattress. Old mattresses sag and spread.",
    "Measure the length (head to foot) in inches. If it falls between two sizes, pick the smaller one.",
    "Measure the breadth (side to side). Take it at the head end and the foot end and use the smaller number.",
    "Box bed or storage bed? Measure inside the lip, and check the lid opens with the height you choose (6 or 8 inch).",
  ],
  fitNote: "A mattress should be ½ to 1 inch smaller than the frame so sheets tuck in and it doesn't bulge.",
};

export function getSizing(site?: SiteSettings): Sizing {
  return { ...DEFAULT_SIZING, ...(site?.sizing || {}), measureSteps: site?.sizing?.measureSteps?.length ? site.sizing.measureSteps : DEFAULT_SIZING.measureSteps };
}

export const dimLabel = (group: string, l: number, w: number) => `${group} ${l} × ${w} in`;
export const toCm = (inch: number) => Math.round(inch * 2.54);

const round10 = (n: number) => Math.round(n / 10) * 10;

/* Full standard chart for a product, keeping each group's old price at its smallest size. */
export function standardChart(basePrice: number, groupAdd: Record<string, number>): SizeRow[] {
  const rows: SizeRow[] = [];
  for (const g of SIZE_GROUPS) {
    const add = groupAdd[g.id] ?? 0;
    const refArea = LENGTHS[0] * g.widths[0];
    for (const w of g.widths) {
      for (const l of LENGTHS) {
        const ratio = (l * w) / refArea;
        rows.push({ label: dimLabel(g.id, l, w), group: g.id, length: l, width: w, priceAdd: add + round10((basePrice + add) * (ratio - 1) * 0.6) });
      }
    }
  }
  return rows;
}

/* Old products had just "Single/Double/Queen/King" — expand them into the full chart once. */
export function expandSizes(p: Mattress): SizeRow[] {
  const rows = p.sizes as SizeRow[];
  if (rows.some((r) => r.length && r.width)) return rows;
  const groupAdd: Record<string, number> = {};
  for (const r of rows) if (SIZE_GROUPS.some((g) => g.id === r.label)) groupAdd[r.label] = r.priceAdd;
  if (!Object.keys(groupAdd).length) return rows;
  return standardChart(p.basePrice, groupAdd).filter((r) => r.group! in groupAdd);
}

export function groupsOf(rows: SizeRow[]) {
  const order = SIZE_GROUPS.map((g) => g.id);
  const map = new Map<string, SizeRow[]>();
  for (const r of rows) {
    const g = r.group || r.label.split(" ")[0] || "Other";
    map.set(g, [...(map.get(g) || []), r]);
  }
  return [...map.entries()]
    .sort((a, b) => (order.indexOf(a[0]) + 99) % 99 - (order.indexOf(b[0]) + 99) % 99)
    .map(([id, list]) => ({ id, rows: list.sort((a, b) => (a.width || 0) - (b.width || 0) || (a.length || 0) - (b.length || 0)) }));
}

/* ---------- custom sizes ---------- */

const CUSTOM = /^Custom (\d{2,3}(?:\.5)?) × (\d{2,3}(?:\.5)?) in$/;
export const customLabel = (l: number, w: number) => `Custom ${l} × ${w} in`;

export function parseCustom(label: string) {
  const m = CUSTOM.exec(label);
  return m ? { length: Number(m[1]), width: Number(m[2]) } : null;
}

export function customCheck(l: number, w: number, s: Sizing): string | null {
  if (!s.customEnabled) return "Custom sizes aren't available right now.";
  if (!Number.isFinite(l) || !Number.isFinite(w) || !l || !w) return "Enter both length and breadth.";
  if (l * 2 !== Math.round(l * 2) || w * 2 !== Math.round(w * 2)) return "Use whole or half inches (like 70 or 70.5).";
  if (l < s.minLength || l > s.maxLength) return `Length must be between ${s.minLength} and ${s.maxLength} inches.`;
  if (w < s.minWidth || w > s.maxWidth) return `Breadth must be between ${s.minWidth} and ${s.maxWidth} inches.`;
  if (w > l) return "Breadth can't be more than length — did you swap them?";
  return null;
}

/* Price a custom size: the smallest standard size it fits inside, plus the custom-cut fee. */
export function customPrice(rows: SizeRow[], l: number, w: number, s: Sizing) {
  if (customCheck(l, w, s)) return null;
  const fits = rows
    .filter((r) => r.length && r.width && r.length >= l && r.width >= w)
    .sort((a, b) => a.length! * a.width! - b.length! * b.width! || a.priceAdd - b.priceAdd)[0];
  const base = fits || [...rows].sort((a, b) => b.priceAdd - a.priceAdd)[0];
  if (!base) return null;
  return { from: base, priceAdd: base.priceAdd + s.customFee };
}

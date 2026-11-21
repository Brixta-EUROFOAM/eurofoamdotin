/*
  PIN-code serviceability and delivery estimates.

  Zones are worked out from the PIN code prefix (India Post's own scheme:
  first digit = region, first three = sorting district). Edit DELIVERY_ZONES
  to match what your transporter actually achieves — the estimates are
  shown to customers, so keep them honest and slightly conservative.
*/

export type DeliveryZone = {
  id: string;
  label: string;
  /* PIN prefixes this zone covers; the longest matching prefix wins. */
  prefixes: string[];
  minDays: number;
  maxDays: number;
};

export const DISPATCH_FROM = "Silchar, Assam";

/* Delivery scope: all of Assam (including Guwahati) and Meghalaya ONLY.
   Meghalaya also has some 78-prefixed shared postal districts, which are
   accepted by the Assam-circle 78 prefix and displayed using postal lookup.
   These prefixes are an eligibility screen, NOT an exhaustive list of valid
   post offices or a courier guarantee. Confirm actual serviceability and ETA.
*/
export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: "assam-barak", label: "Assam — Barak Valley", prefixes: ["788"], minDays: 1, maxDays: 3 },
  { id: "assam", label: "Assam", prefixes: ["78"], minDays: 3, maxDays: 6 },
  { id: "meghalaya", label: "Meghalaya", prefixes: ["793", "794"], minDays: 3, maxDays: 6 },
];

export function isValidPin(pin: string) {
  return /^[1-9]\d{5}$/.test(pin);
}

export type PinCheck =
  | { ok: true; pin: string; zone: DeliveryZone; minDays: number; maxDays: number }
  | { ok: false; pin: string; reason: "invalid" | "unserviceable" };

export function checkPin(raw: string): PinCheck {
  const pin = String(raw || "").replace(/\D/g, "").slice(0, 6);
  if (!isValidPin(pin)) return { ok: false, pin, reason: "invalid" };

  let best: DeliveryZone | null = null;
  let bestLen = 0;
  for (const zone of DELIVERY_ZONES) {
    for (const prefix of zone.prefixes) {
      if (pin.startsWith(prefix) && prefix.length > bestLen) {
        best = zone;
        bestLen = prefix.length;
      }
    }
  }
  if (!best) return { ok: false, pin, reason: "unserviceable" };
  return { ok: true, pin, zone: best, minDays: best.minDays, maxDays: best.maxDays };
}

/* "Thu 23 Oct – Mon 27 Oct", skipping Sundays for dispatch. */
export function etaRange(minDays: number, maxDays: number, from = new Date()) {
  const add = (days: number) => {
    const d = new Date(from);
    let left = days;
    while (left > 0) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) left--;
    }
    return d;
  };
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return `${fmt(add(minDays))} – ${fmt(add(maxDays))}`;
}

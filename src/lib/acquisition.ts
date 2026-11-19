/** No identity or browser fingerprint: only voluntary campaign parameters. */
export type Acquisition = {
  source?: string; medium?: string; campaign?: string; content?: string; term?: string;
  landing?: string; referrer?: string;
};
const clean = (v: unknown, limit: number) => typeof v === "string"
  ? v.replace(/[\r\n<>]/g, "").trim().slice(0, limit) : "";
export function normalizeAcquisition(raw: unknown): Acquisition | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const r = raw as Record<string, unknown>;
  const out: Acquisition = {
    source: clean(r.source, 70), medium: clean(r.medium, 70),
    campaign: clean(r.campaign, 120), content: clean(r.content, 120),
    term: clean(r.term, 120), landing: clean(r.landing, 180),
    referrer: clean(r.referrer, 150),
  };
  return Object.values(out).some(Boolean) ? out : undefined;
}

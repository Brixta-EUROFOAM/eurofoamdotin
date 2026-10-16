import { promises as fs } from "fs";
import path from "path";
import { dataDir } from "@/lib/store";

/*
  Storage limitation (DPDP Act s.8(7)): drop log lines older than the
  retention period promised in the privacy notice. Runs at most once a
  day per file, lazily, from the code that writes to that file.
*/

const RULES: Record<string, { days: number; field: string }> = {
  "telemetry.jsonl": { days: 396, field: "timestamp" }, // 13 months
  "callbacks.jsonl": { days: 183, field: "at" }, // 6 months
};

const lastRun = new Map<string, number>();

export async function pruneIfDue(file: keyof typeof RULES | string) {
  const rule = RULES[file];
  if (!rule) return;
  const now = Date.now();
  if (now - (lastRun.get(file) || 0) < 24 * 60 * 60 * 1000) return;
  lastRun.set(file, now);

  const full = path.join(dataDir(), file);
  try {
    const raw = await fs.readFile(full, "utf-8");
    const cutoff = now - rule.days * 24 * 60 * 60 * 1000;
    const lines = raw.split("\n").filter(Boolean);
    const kept = lines.filter((line) => {
      try {
        const t = new Date(JSON.parse(line)[rule.field]).getTime();
        return !Number.isFinite(t) || t >= cutoff;
      } catch {
        return false;
      }
    });
    if (kept.length === lines.length) return;
    const tmp = `${full}.tmp`;
    await fs.writeFile(tmp, kept.join("\n") + (kept.length ? "\n" : ""), "utf-8");
    await fs.rename(tmp, full);
  } catch {
    /* file missing — nothing to prune */
  }
}

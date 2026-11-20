import { promises as fs } from "node:fs";
import path from "node:path";
import { db, hasDb } from "@/lib/db";
import { dataDir } from "@/lib/store";

export type SpendRow = { source: string; campaign: string; start: string; end: string; amount: number };
const key = "gadda:campaign-spend:v1";
const dest = () => path.join(dataDir(), "gadda-campaign-spend.json");
export function validSpendRow(raw: unknown): SpendRow | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const x = raw as Record<string, unknown>;
  const source = String(x.source || "").trim().toLowerCase();
  const campaign = String(x.campaign || "").trim();
  const start = String(x.start || "");
  const end = String(x.end || "");
  const amount = Number(x.amount);
  if (!/^[a-z0-9_-]{2,50}$/.test(source) || !/^[a-z0-9 _.-]{2,100}$/i.test(campaign)) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return null;
  if (!Number.isFinite(Date.parse(start)) || !Number.isFinite(Date.parse(end)) || end < start) return null;
  if (!Number.isFinite(amount) || amount < 0 || amount > 100000000) return null;
  return { source, campaign, start, end, amount: Math.round(amount * 100) / 100 };
}
export async function readCampaignSpend(): Promise<SpendRow[]> {
  try {
    const raw = hasDb()
      ? (await (await db()).query("select value from gadda.meta where key = $1", [key])).rows[0]?.value
      : await fs.readFile(dest(), "utf8");
    if (!raw) return [];
    const rows = JSON.parse(raw);
    return Array.isArray(rows) ? rows.map(validSpendRow).filter((r): r is SpendRow => r !== null).slice(0,500) : [];
  } catch (error) {
    if (!hasDb() && (error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
export async function saveCampaignSpend(rows: SpendRow[]): Promise<void> {
  const data = JSON.stringify(rows.slice(0,500));
  if (hasDb()) {
    await (await db()).query("insert into gadda.meta (key,value) values ($1,$2) on conflict (key) do update set value=excluded.value,at=now()", [key,data]);
  } else {
    await fs.mkdir(dataDir(), { recursive: true });
    const tmp = `${dest()}.${process.pid}.tmp`;
    await fs.writeFile(tmp, data, { mode: 0o600 });
    await fs.rename(tmp,dest());
  }
}

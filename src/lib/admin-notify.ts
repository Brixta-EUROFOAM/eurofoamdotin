import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { db, hasDb } from "@/lib/db";
import { dataDir } from "@/lib/store";

/** GADDA admin alerts. Only called on the server after a lead/order is persisted. */
type Alert = { key: string; title: string; lines: string[] };
type State = "pending" | "sending" | "accepted" | "failed" | "uncertain";
type Entry = { key: string; subject: string; body: string; state: State; attempts: number; updatedAt: string; detail?: string };

const apiKey = () => process.env.BREVO_API_KEY?.trim() || "";
const sender = () => process.env.GADDA_ALERT_FROM?.trim() || "";
const recipient = () => process.env.GADDA_ALERT_TO?.trim() || "admin@eurofoam.in";
const configured = () => Boolean(apiKey() && sender() && recipient());
const safeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const ident = (key: string) => `brevo:${createHash("sha256").update(key).digest("hex")}`;
const folder = () => path.join(dataDir(), "brevo-alerts");
const fileOf = (key: string) => path.join(folder(), `${ident(key)}.json`);
const now = () => new Date().toISOString();

function parse(data: string): Entry | null {
  try { const entry = JSON.parse(data) as Entry; return entry?.key && entry.state ? entry : null; }
  catch { return null; }
}

async function saveFile(entry: Entry) {
  await fs.mkdir(folder(), { recursive: true });
  const dest = fileOf(entry.key);
  const tmp = `${dest}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(entry), { mode: 0o600 });
  await fs.rename(tmp, dest);
}

async function getEntry(key: string): Promise<Entry | null> {
  if (hasDb()) {
    const { rows } = await (await db()).query("select value from gadda.meta where key = $1", [ident(key)]);
    return rows[0] ? parse(rows[0].value) : null;
  }
  try { return parse(await fs.readFile(fileOf(key), "utf8")); }
  catch { return null; }
}

async function enqueue(event: Alert) {
  const key = event.key.slice(0, 160);
  const subject = `[GADDA] ${event.title}`.replace(/[\r\n]/g, " ").slice(0, 180);
  const body = event.lines.join("\n").slice(0, 12000);
  const entry: Entry = { key, subject, body, state: "pending", attempts: 0, updatedAt: now() };
  if (hasDb()) {
    await (await db()).query(
      "insert into gadda.meta (key, value) values ($1, $2) on conflict (key) do nothing",
      [ident(key), JSON.stringify(entry)],
    );
  } else {
    await fs.mkdir(folder(), { recursive: true });
    try {
      const file = await fs.open(fileOf(key), "wx", 0o600);
      try { await file.writeFile(JSON.stringify(entry)); } finally { await file.close(); }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
    }
  }
  return key;
}

/** Compare-and-swap in Postgres prevents two webhook handlers sending the same alert. */
async function replaceEntry(old: Entry, next: Entry): Promise<boolean> {
  if (hasDb()) {
    const result = await (await db()).query(
      "update gadda.meta set value=$3, at=now() where key=$1 and value=$2 returning key",
      [ident(old.key), JSON.stringify(old), JSON.stringify(next)],
    );
    return (result.rowCount || 0) > 0;
  }
  await saveFile(next);
  return true;
}

/** Call Brevo once for each event. A network timeout is marked 'uncertain', not blindly retried. */
async function deliver(key: string, manual = false): Promise<boolean> {
  if (!configured() || !safeEmail(sender()) || !safeEmail(recipient())) return false;
  const lockPath = `${fileOf(key)}.lock`;
  let lock: Awaited<ReturnType<typeof fs.open>> | undefined;
  if (!hasDb()) {
    try { lock = await fs.open(lockPath, "wx", 0o600); }
    catch (err) {
      if ((err as NodeJS.ErrnoException).code === "EEXIST") return false;
      throw err;
    }
  }
  try {
    const existing = await getEntry(key);
    if (!existing || (existing.state !== "pending" && !(manual && existing.state === "failed"))) return false;
    const sending: Entry = { ...existing, state: "sending", attempts: existing.attempts + 1, updatedAt: now(), detail: undefined };
    if (!(await replaceEntry(existing, sending))) return false;
    let state: State = "uncertain";
    let detail = "Network request ended without a definitive provider response. Check Brevo logs before retrying.";
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": apiKey(), "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          sender: { name: "GADDA Orders", email: sender() },
          to: [{ email: recipient() }],
          subject: sending.subject,
          textContent: sending.body,
        }),
        signal: AbortSignal.timeout(4500),
        cache: "no-store",
      });
      state = res.ok ? "accepted" : "failed";
      detail = res.ok ? "Accepted by Brevo; verify delivery in Brevo Transactional Logs." : `Brevo rejected request (HTTP ${res.status}).`;
    } catch (err) {
      console.error("[gadda brevo] Request outcome uncertain", (err as Error).name);
    }
    // Keep the body only for a definitive provider rejection that can be retried.
    const updated: Entry = { ...sending, state, body: state === "accepted" ? "" : sending.body, updatedAt: now(), detail };
    if (!(await replaceEntry(sending, updated))) console.error("[gadda brevo] Failed to persist state for", ident(key));
    if (state === "failed") console.error("[gadda brevo]", detail, sending.subject);
    return state === "accepted";
  } finally {
    if (lock) { await lock.close(); await fs.unlink(lockPath).catch(() => {}); }
  }
}

/** This function never propagates mail errors into customer checkout or Razorpay webhooks. */
export async function notifyAdmin(event: Alert): Promise<void> {
  if (!configured()) return;
  try {
    const key = await enqueue(event);
    await deliver(key);
  } catch (err) {
    console.error("[gadda brevo] Could not queue/send alert", (err as Error).message);
  }
}

async function entries(): Promise<Entry[]> {
  if (hasDb()) {
    const { rows } = await (await db()).query("select value from gadda.meta where key like 'brevo:%' order by at desc limit 2000");
    return rows.map((r: { value: string }) => parse(r.value)).filter((e: Entry | null): e is Entry => Boolean(e));
  }
  try {
    const names = (await fs.readdir(folder())).filter(n => n.endsWith(".json")).slice(0, 2000);
    const results = await Promise.all(names.map(async name => {
      try { return parse(await fs.readFile(path.join(folder(), name), "utf8")); } catch { return null; }
    }));
    return results.filter((e): e is Entry => Boolean(e));
  } catch { return []; }
}

/** Admin-only endpoint calls these: never expose an email key or full email body in a response. */
export async function adminNotificationStatus() {
  const rows = await entries();
  const counts: Record<State, number> = { pending: 0, sending: 0, accepted: 0, failed: 0, uncertain: 0 };
  for (const row of rows) counts[row.state]++;
  return { configured: configured(), counts,
    recent: rows.slice(0, 10).map(e => ({ subject: e.subject, status: e.state, at: e.updatedAt, detail: e.detail })) };
}

/** Retry definitive HTTP rejections only. 'Uncertain' sends need Brevo-log reconciliation. */
export async function retryFailedAdminNotifications(max = 10) {
  const failed = (await entries()).filter(e => e.state === "failed").slice(0, Math.max(0, Math.min(10, max)));
  let accepted = 0;
  for (const item of failed) if (await deliver(item.key, true)) accepted++;
  return { attempted: failed.length, accepted };
}

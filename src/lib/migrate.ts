import { promises as fs } from "fs";
import path from "path";
import { db, hasDb, SCHEMA } from "@/lib/db";
import { dataDir, mediaDir } from "@/lib/store";
import { normalizeAdminFile, writeAdminRows } from "@/lib/admin-auth";
import { readCustomerFile } from "@/lib/customerAuth";
import { insertOrder, listOrderFile } from "@/lib/orders";
import { insertEvent, readTelemetryFile } from "@/lib/telemetry";
import { addCallback, addConsent, addSubscriber, readLeadFile, saveMedia, type Callback, type ConsentReceipt, type Subscriber } from "@/lib/leads";

/*
  Runs once when the production server starts (src/instrumentation.ts):
   1. creates schema "gadda" and every table (db() does this)
   2. the very first time only, copies anything in the old data/ files
      into Postgres, then records that in gadda.meta so it never repeats.
*/

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif",
};

async function readJson(file: string): Promise<unknown> {
  try {
    return JSON.parse(await fs.readFile(path.join(dataDir(), file), "utf-8"));
  } catch {
    return null;
  }
}

export async function migrate() {
  if (!hasDb()) {
    console.log("[db] DATABASE_URL not set — using files in data/");
    return;
  }
  const pool = await db();
  console.log(`[db] schema "${SCHEMA}" ready`);

  const done = await pool.query("select 1 from gadda.meta where key = 'files_imported'");
  if (done.rowCount) return;

  const n: Record<string, number> = {};
  const count = (k: string) => (n[k] = (n[k] || 0) + 1);

  const store = (await readJson("store.json")) as { site?: unknown } | null;
  if (store?.site) {
    await pool.query(
      `insert into gadda.store (id, data) values (1, $1) on conflict (id) do nothing`,
      [JSON.stringify(store)]
    );
    count("store");
  }

  const admins = normalizeAdminFile(await readJson("admin.json"));
  const existingAdmins = await pool.query("select 1 from gadda.admins limit 1");
  if (admins.admins.length && !existingAdmins.rowCount) {
    await writeAdminRows(admins);
    n.admins = admins.admins.length;
  }

  for (const c of await readCustomerFile()) {
    await pool.query(
      `insert into gadda.customers (id, name, email, mobile, password_hash, created_at)
       values ($1, $2, $3, $4, $5, $6) on conflict do nothing`,
      [c.id, c.name, c.email, c.mobile || "", c.passwordHash, c.createdAt]
    );
    count("customers");
  }

  for (const o of await listOrderFile()) {
    await insertOrder(o);
    count("orders");
  }

  for (const e of await readTelemetryFile(400)) {
    await insertEvent(e);
    count("events");
  }

  for (const r of await readLeadFile("callbacks")) {
    await addCallback(r as Callback);
    count("callbacks");
  }
  for (const r of await readLeadFile("subscribers")) {
    await addSubscriber(r as Subscriber);
    count("subscribers");
  }
  for (const r of await readLeadFile("consent")) {
    await addConsent(r as ConsentReceipt);
    count("consent");
  }

  try {
    for (const f of await fs.readdir(mediaDir())) {
      const mime = MIME[path.extname(f).toLowerCase()];
      if (!mime) continue;
      await saveMedia(f, mime, await fs.readFile(path.join(mediaDir(), f)));
      count("media");
    }
  } catch {
    /* no media folder */
  }

  await pool.query(
    `insert into gadda.meta (key, value) values ('files_imported', $1) on conflict (key) do nothing`,
    [JSON.stringify(n)]
  );
  console.log("[db] imported from data/:", Object.keys(n).length ? n : "nothing to import");
}

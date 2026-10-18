import { promises as fs } from "fs";
import path from "path";
import { defaultStoreData, type StoreData } from "@/lib/catalog";
import { db, hasDb } from "@/lib/db";

/*
  Site settings, products and reviews.
  - With DATABASE_URL: one row in gadda.store.
  - Without: data/store.json (local development).
*/

export function dataDir() {
  return process.env.CMS_DATA_DIR || path.join(process.cwd(), "data");
}

export function mediaDir() {
  return path.join(dataDir(), "media");
}

function storePath() {
  return path.join(dataDir(), "store.json");
}

function valid(parsed: unknown): parsed is StoreData {
  const p = parsed as StoreData;
  return Boolean(p?.site && Array.isArray(p.products) && Array.isArray(p.reviews));
}

export async function ensureStore() {
  if (hasDb()) return;
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.mkdir(mediaDir(), { recursive: true });
  try {
    await fs.access(storePath());
  } catch {
    await fs.writeFile(storePath(), JSON.stringify(defaultStoreData, null, 2), "utf-8");
  }
}

export async function getStoreData(): Promise<StoreData> {
  if (hasDb()) {
    try {
      const pool = await db();
      const { rows } = await pool.query("select data from gadda.store where id = 1");
      return rows[0] && valid(rows[0].data) ? (rows[0].data as StoreData) : defaultStoreData;
    } catch (e) {
      console.error("[store] database unavailable, showing defaults:", (e as Error).message);
      return defaultStoreData;
    }
  }

  await ensureStore();
  try {
    const parsed = JSON.parse(await fs.readFile(storePath(), "utf-8"));
    return valid(parsed) ? parsed : defaultStoreData;
  } catch {
    return defaultStoreData;
  }
}

export async function saveStoreData(data: StoreData) {
  if (hasDb()) {
    const pool = await db();
    await pool.query(
      `insert into gadda.store (id, data, updated_at) values (1, $1, now())
       on conflict (id) do update set data = excluded.data, updated_at = now()`,
      [JSON.stringify(data)],
    );
    return;
  }

  await ensureStore();
  const temp = `${storePath()}.tmp`;
  await fs.writeFile(temp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(temp, storePath());
}

export async function getProduct(slug: string) {
  const data = await getStoreData();
  return data.products.find((product) => product.slug === slug);
}

import { promises as fs } from "fs";
import path from "path";
import { defaultStoreData, type Mattress, type StoreData } from "@/lib/catalog";
import { SHIPPED_PHOTOS, gaddaProducts } from "@/lib/gadda-products";
import { db, hasDb } from "@/lib/db";
import { expandSizes } from "@/lib/sizes";

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

/* Older saved products only had Single/Double/Queen/King — give them full dimension charts. */
function upgrade(d: StoreData): StoreData {
  return { ...d, products: d.products.map((p) => withUltimateLayers(withShippedPhotos({ ...p, sizes: expandSizes(p) }))) };
}

/* Photo sets ship with the site (Regular, Pro): give them to a saved product that still has no photos of its own. */
function withShippedPhotos(p: Mattress): Mattress {
  const set = SHIPPED_PHOTOS[p.slug];
  if (!set) return p;
  // saved with the shipped photos in an older order → use the current order (layers photo first)
  const saved = [p.image, ...(p.gallery || [])].filter(Boolean);
  if (saved.length === set.length && saved.every((x) => set.includes(x)) && saved.join() !== set.join()) {
    return { ...p, image: set[0], gallery: set.slice(1) };
  }
  if (p.gallery?.length) return p;
  const placeholder = !p.image || p.image.includes("unsplash") || p.image.includes("a-mattress-on-a-wooden-floor");
  if (!placeholder) return p;
  return { ...p, image: set[0], gallery: set.slice(1), slides: p.slides || ["trial", "sizes", "delivery"] };
}

/* Ultimate's layers changed to cover → natural latex → adaptive → 40D HR (latex now standard).
   A saved Ultimate still on the old cool-memory-foam setup is moved to the new one. */
function withUltimateLayers(p: Mattress): Mattress {
  if (p.slug !== "gadda-ultimate" || !p.layers.some((l) => l.visualKind === "cool")) return p;
  const fresh = gaddaProducts.find((x) => x.slug === "gadda-ultimate");
  if (!fresh) return p;
  return { ...p, layers: fresh.layers, options: fresh.options, features: fresh.features, shortDescription: fresh.shortDescription, longDescription: fresh.longDescription };
}

export async function getStoreData(): Promise<StoreData> {
  return upgrade(await readStoreData());
}

async function readStoreData(): Promise<StoreData> {
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

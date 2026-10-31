import { promises as fs } from "fs";
import path from "path";
import { defaultStoreData, type Mattress, type StoreData } from "@/lib/catalog";
import {
  LEGACY_PHOTOS,
  OLD_MAIN_PHOTOS,
  PHOTO_RELEASE,
  PREVIOUS_ORDERS,
  SHIPPED_CARDS,
  SHIPPED_PHOTOS,
  gaddaProducts,
} from "@/lib/gadda-products";
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
  return {
    ...d,
    products: d.products.map((p) =>
      withUltimateLayers(withCardImage(withPhotoRelease(withMainPhoto(withShippedPhotos({ ...p, sizes: expandSizes(p) }))))),
    ),
  };
}

/* A new shipped photo set replaces the saved photos once (Admin changes after that are kept). */
function withPhotoRelease(p: Mattress): Mattress {
  const release = PHOTO_RELEASE[p.slug];
  const set = SHIPPED_PHOTOS[p.slug];
  if (!release || !set || p.photoSet === release) return p;
  return { ...p, image: set[0], gallery: set.slice(1), cardImage: SHIPPED_CARDS[p.slug] || "", cardFocus: undefined, photoSet: release };
}

/* Shop cards show the whole layer stack, as long as the product still uses its shipped main photo
   and no card picture of its own was chosen in Admin. */
function withCardImage(p: Mattress): Mattress {
  const card = SHIPPED_CARDS[p.slug];
  if (!card || p.cardImage?.trim() || p.image !== SHIPPED_PHOTOS[p.slug]?.[0]) return p;
  return { ...p, cardImage: card };
}

/* A saved product still showing an earlier shipped main photo gets the current one; other photos stay. */
function withMainPhoto(p: Mattress): Mattress {
  const old = OLD_MAIN_PHOTOS[p.slug];
  const main = SHIPPED_PHOTOS[p.slug]?.[0];
  if (!old || !main || !old.includes(p.image)) return p;
  return { ...p, image: main, gallery: (p.gallery || []).filter((x) => x !== main && !old.includes(x)) };
}

/* Photo sets ship with the site (Regular, Pro): give them to a saved product that still has no photos of its own. */
function withShippedPhotos(p: Mattress): Mattress {
  const set = SHIPPED_PHOTOS[p.slug];
  if (!set) return p;
  // saved with the shipped photos in an older order → use the current order (layers photo first)
  const saved = [p.image, ...(p.gallery || [])].filter(Boolean);
  const legacy = LEGACY_PHOTOS[p.slug] || [];
  if (saved.length && saved.every((x) => legacy.includes(x))) return { ...p, image: set[0], gallery: set.slice(1) };
  if ((PREVIOUS_ORDERS[p.slug] || []).some((old) => old.join() === saved.join())) {
    return { ...p, image: set[0], gallery: set.slice(1) };
  }
  if (p.gallery?.length) return p;
  const placeholder = !p.image || p.image.includes("unsplash") || p.image.includes("a-mattress-on-a-wooden-floor");
  if (!placeholder) return p;
  return { ...p, image: set[0], gallery: set.slice(1), slides: p.slides || ["trial", "sizes", "delivery"] };
}

/* Ultimate is cover → cool memory foam → adaptive → 40D HR, with natural latex as a paid
   upgrade for the top layer. A saved Ultimate that has latex as standard and no latex
   upgrade on offer is moved to this setup (price, sizes and photos are kept). */
function withUltimateLayers(p: Mattress): Mattress {
  const latexStandard = p.layers[1]?.visualKind === "latex" || /latex/i.test(p.layers[1]?.name || "");
  const latexUpgrade = (p.options || []).some((o) => o.choices.some((c) => /latex/i.test(c.label)));
  if (p.slug !== "gadda-ultimate" || !latexStandard || latexUpgrade) return p;
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

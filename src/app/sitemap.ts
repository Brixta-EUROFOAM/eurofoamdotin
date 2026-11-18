import type { MetadataRoute } from "next";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getStoreData, dataDir } from "@/lib/store";
import { db, hasDb } from "@/lib/db";
import { POLICIES } from "@/lib/policies";
import { siteUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

async function catalogueModified(): Promise<Date | undefined> {
  try {
    if (hasDb()) {
      const { rows } = await (await db()).query("select updated_at from gadda.store where id=1");
      const dt = rows[0]?.updated_at;
      return dt ? new Date(dt) : undefined;
    }
    return (await fs.stat(path.join(dataDir(), "store.json"))).mtime;
  } catch { return undefined; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getStoreData();
  const catalogDate = await catalogueModified();
  const page = (pathname: string, priority: number, frequency: "weekly" | "monthly" | "yearly" = "monthly", lastModified?: Date) => ({
    url: siteUrl(pathname),
    ...(lastModified && !Number.isNaN(lastModified.getTime()) ? { lastModified } : {}),
    changeFrequency: frequency, priority,
  });
  return [
    page("/", 1, "weekly", catalogDate),
    page("/mattresses", 0.95, "weekly", catalogDate),
    page("/mattresses/guwahati", 0.9, "weekly", catalogDate),
    ...products.map((p) => page(`/mattresses/${p.slug}`, 0.9, "weekly", catalogDate)),
    page("/compare", 0.75, "weekly", catalogDate),
    page("/size-guide", 0.6),
    page("/sleep-quiz", 0.6),
    page("/why-gadda", 0.55),
    page("/reviews", 0.4),
    page("/contact", 0.6),
    page("/business-information", 0.4),
    ...POLICIES.map((p) => page(`/policies/${p.slug}`, 0.2, "yearly")),
  ];
}

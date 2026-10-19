import type { MetadataRoute } from "next";
import { getStoreData } from "@/lib/store";
import { POLICIES } from "@/lib/policies";
import { siteUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getStoreData();
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({
    url: siteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "weekly"),
    page("/mattresses", 0.9, "weekly"),
    ...products.map((p) => page(`/mattresses/${p.slug}`, 0.9, "weekly")),
    page("/compare", 0.7),
    page("/size-guide", 0.6),
    page("/sleep-quiz", 0.6),
    page("/why-gadda", 0.5),
    page("/reviews", 0.5, "weekly"),
    page("/contact", 0.5),
    page("/business-information", 0.3, "yearly"),
    ...POLICIES.map((p) => page(`/policies/${p.slug}`, 0.3, "yearly")),
  ];
}

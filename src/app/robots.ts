import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/public-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/checkout", "/cart", "/account", "/wishlist", "/track-order"] }],
    sitemap: siteUrl("/sitemap.xml"),
  };
}

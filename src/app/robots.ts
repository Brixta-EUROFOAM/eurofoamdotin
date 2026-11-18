import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/public-url";

/* Public catalogue accessible to traditional and answer-engine crawlers.
   Private pages are noindexed separately (robots is NOT a security mechanism). */
const privatePaths = ["/admin", "/ops", "/api/", "/checkout", "/cart", "/account", "/wishlist", "/track-order", "/payment/"];
const bots = ["*", "Googlebot", "Google-Extended", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot"];
export default function robots(): MetadataRoute.Robots {
  return {
    rules: bots.map((userAgent) => ({ userAgent, allow: "/", disallow: privatePaths })),
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl("/"),
  };
}

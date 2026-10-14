import type { NextConfig } from "next";

/* Old product URLs keep working after the line-up rename. */
const legacySlugs: Record<string, string> = {
  "euro-easy": "gadda-regular",
  "euro-align": "gadda-pro",
  "euro-float": "gadda-pro",
  "euro-air": "gadda-ultimate",
};

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return Object.entries(legacySlugs).map(([from, to]) => ({
      source: `/mattresses/${from}`,
      destination: `/mattresses/${to}`,
      permanent: true,
    }));
  },
};

export default nextConfig;

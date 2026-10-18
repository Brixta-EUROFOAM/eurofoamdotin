import type { NextConfig } from "next";

/* Old product URLs keep working after the line-up rename. */
const legacySlugs: Record<string, string> = {
  "euro-easy": "gadda-regular",
  "euro-align": "gadda-pro",
  "euro-float": "gadda-pro",
  "euro-air": "gadda-ultimate",
};

/* Security headers on every response (CSP is set per request in src/proxy.ts). */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(self), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=(), browsing-topics=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  serverExternalPackages: ["pg"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/media/:path*",
        headers: [{ key: "Content-Security-Policy", value: "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox" }],
      },
    ];
  },
  async redirects() {
    return [
      ...Object.entries(legacySlugs).map(([from, to]) => ({
        source: `/mattresses/${from}`,
        destination: `/mattresses/${to}`,
        permanent: true,
      })),
      { source: "/why-eurofoam", destination: "/why-gadda", permanent: true },
      { source: "/privacy", destination: "/policies/privacy", permanent: true },
      { source: "/terms", destination: "/policies/terms", permanent: true },
    ];
  },
};

export default nextConfig;

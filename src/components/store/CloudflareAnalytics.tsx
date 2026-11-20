"use client";
import Script from "next/script";
import { useConsent } from "@/components/store/ConsentProvider";

const token = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN || "";
export default function CloudflareAnalytics({ nonce }: { nonce?: string }) {
  const { analytics } = useConsent();
  if (!analytics || !/^[A-Za-z0-9-]{12,100}$/.test(token)) return null;
  return <Script id="gadda-cf-web-analytics"
    src="https://static.cloudflareinsights.com/beacon.min.js"
    strategy="afterInteractive" nonce={nonce}
    data-cf-beacon={JSON.stringify({ token })} />;
}

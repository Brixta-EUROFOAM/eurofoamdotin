"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "@/components/store/ConsentProvider";

/**
 * Direct GA4. This avoids needing a published Google tag in GTM.
 * Loads *only* after explicit analytics consent, respecting GPC/DNT.
 * When GTM is deliberately enabled through NEXT_PUBLIC_ENABLE_GTM=true,
 * direct GA4 is disabled to prevent duplicate measurement.
 */
const ID = "G-S5YGN608LE";
const DIRECT_GA4 = process.env.NEXT_PUBLIC_ENABLE_GTM !== "true";

function optedOut() {
  return navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true;
}

export default function GA4Tracker({ nonce }: { nonce?: string }) {
  const pathname = usePathname() || "/";
  const { analytics, marketing } = useConsent();
  const initialized = useRef(false);
  const lastPage = useRef<string | null>(null);

  useEffect(() => {
    if (!DIRECT_GA4 || !analytics || pathname.startsWith("/admin") || optedOut()) {
      lastPage.current = null;
      return;
    }
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") {
      window.gtag = (...args: unknown[]) => { window.dataLayer?.push(args); };
    }

    if (!initialized.current) {
      // Consent granted before loading Google. No Google requests before opt-in.
      window.gtag("consent", "default", {
        analytics_storage: "granted",
        ad_storage: marketing ? "granted" : "denied",
        ad_user_data: marketing ? "granted" : "denied",
        ad_personalization: marketing ? "granted" : "denied",
      });
      window.gtag("js", new Date());
      // Page views are explicitly tracked on route changes, not on config.
      window.gtag("config", ID, { send_page_view: false });
      initialized.current = true;
    }
    if (!document.getElementById("gadda-ga4-script")) {
      const script = document.createElement("script");
      script.id = "gadda-ga4-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
      if (nonce) script.nonce = nonce;
      document.head.appendChild(script);
    }

    // No query string: avoids accidentally forwarding PII in URL parameters.
    if (lastPage.current !== pathname) {
      window.gtag("event", "page_view", {
        send_to: ID,
        page_path: pathname,
        page_location: `${window.location.origin}${pathname}`,
        page_title: document.title,
      });
      lastPage.current = pathname;
    }
  }, [analytics, marketing, pathname, nonce]);

  return null;
}

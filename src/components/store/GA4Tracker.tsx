"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "@/components/store/ConsentProvider";

/**
 * gadda-ga4-safari-fix-v1
 * Direct GA4 after explicit consent. Keeps GTM off by default to prevent duplicates.
 * Uses Google's arguments-shaped queue and waits for a successful script load
 * before emitting the first page_view. No analytics requests before consent.
 */
const ID = "G-S5YGN608LE";
const DIRECT_GA4 = process.env.NEXT_PUBLIC_ENABLE_GTM !== "true";
const SCRIPT_ID = "gadda-ga4-script";

type DataLayerEntry = IArguments;

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
      window.gtag = function () {
        window.dataLayer?.push(arguments as DataLayerEntry);
      };
    }

    if (!initialized.current) {
      window.gtag("consent", "default", {
        analytics_storage: "granted",
        ad_storage: marketing ? "granted" : "denied",
        ad_user_data: marketing ? "granted" : "denied",
        ad_personalization: marketing ? "granted" : "denied",
      });
      window.gtag("js", new Date());
      window.gtag("config", ID, { send_page_view: false });
      initialized.current = true;
    } else {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: marketing ? "granted" : "denied",
        ad_user_data: marketing ? "granted" : "denied",
        ad_personalization: marketing ? "granted" : "denied",
      });
    }

    let active = true;
    const pageView = () => {
      if (!active || optedOut() || lastPage.current === pathname) return;
      window.gtag?.("event", "page_view", {
        send_to: ID,
        page_path: pathname,
        page_location: `${window.location.origin}${pathname}`,
        page_title: document.title,
      });
      lastPage.current = pathname;
    };

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const onLoad = () => {
      if (script) script.dataset.loaded = "true";
      pageView();
    };
    const onError = () => {
      console.error("GADDA GA4 script failed to load; check Safari content blockers and CSP.");
    };
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
      if (nonce) script.nonce = nonce;
      script.addEventListener("load", onLoad);
      script.addEventListener("error", onError);
      document.head.appendChild(script);
    } else if (script.dataset.loaded === "true") {
      pageView();
    } else {
      script.addEventListener("load", onLoad);
      script.addEventListener("error", onError);
    }

    return () => {
      active = false;
      script?.removeEventListener("load", onLoad);
      script?.removeEventListener("error", onError);
    };
  }, [analytics, marketing, pathname, nonce]);

  return null;
}

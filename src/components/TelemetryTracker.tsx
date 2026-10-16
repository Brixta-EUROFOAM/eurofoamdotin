"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setAnalyticsAllowed, trackEvent } from "@/lib/telemetry-client";
import { useConsent } from "@/components/store/ConsentProvider";

export default function TelemetryTracker() {
  const pathname = usePathname();
  const { analytics } = useConsent();

  useEffect(() => {
    setAnalyticsAllowed(analytics);
  }, [analytics]);

  useEffect(() => {
    if (!analytics || pathname.startsWith("/admin")) return;
    const started = Date.now();

    trackEvent("page_view");
    const productMatch = pathname.match(/^\/mattresses\/([^/]+)/);
    if (productMatch?.[1]) {
      trackEvent("product_view", { productSlug: decodeURIComponent(productMatch[1]) });
    }

    const sent = new Set<number>();
    function scroll() {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const depth = Math.round((window.scrollY / max) * 100);
      for (const level of [25, 50, 75, 100]) {
        if (depth >= level && !sent.has(level)) {
          sent.add(level);
          trackEvent("scroll_depth", { depth: level });
        }
      }
    }

    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      const durationSeconds = Math.round((Date.now() - started) / 1000);
      if (durationSeconds > 0) trackEvent("page_engagement", { durationSeconds });
    }
    const onHide = () => document.visibilityState === "hidden" && finish();

    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("pagehide", finish);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("pagehide", finish);
      document.removeEventListener("visibilitychange", onHide);
      finish();
    };
  }, [pathname, analytics]);

  return null;
}

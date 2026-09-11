"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/telemetry-client";

export default function TelemetryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const started = Date.now();

    void trackEvent("page_view");

    const productMatch = pathname.match(
      /^\/mattresses\/([^/]+)/
    );

    if (productMatch?.[1]) {
      void trackEvent("product_view", {
        productSlug: decodeURIComponent(productMatch[1])
      });
    }

    const sent = new Set<number>();

    function scroll() {
      const max = Math.max(
        document.documentElement.scrollHeight -
          window.innerHeight,
        1
      );

      const depth = Math.round(
        (window.scrollY / max) * 100
      );

      for (const level of [25, 50, 75, 100]) {
        if (depth >= level && !sent.has(level)) {
          sent.add(level);

          void trackEvent("scroll_depth", {
            depth: level
          });
        }
      }
    }

    function finish() {
      const durationSeconds = Math.round(
        (Date.now() - started) / 1000
      );

      if (durationSeconds > 0) {
        void trackEvent("page_engagement", {
          durationSeconds
        });
      }
    }

    window.addEventListener("scroll", scroll, {
      passive: true
    });

    window.addEventListener("pagehide", finish);

    return () => {
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("pagehide", finish);
      finish();
    };
  }, [pathname]);

  return null;
}

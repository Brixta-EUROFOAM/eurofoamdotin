"use client";

import { useLayoutEffect } from "react";

export default function HomeReloadScrollReset() {
  useLayoutEffect(() => {
    let isReload = false;

    try {
      const entries =
        window.performance.getEntriesByType(
          "navigation"
        );

      if (entries.length > 0) {
        const details =
          entries[0].toJSON();

        isReload =
          details?.type === "reload";
      } else {
        /*
         * Older Safari fallback.
         * TYPE_RELOAD = 1.
         */
        isReload =
          window.performance.navigation?.type === 1;
      }
    } catch {
      isReload = false;
    }

    if (!isReload) {
      return;
    }

    const html =
      document.documentElement;

    const oldScrollBehavior =
      html.style.scrollBehavior;

    /*
     * Important:
     * CSS has scroll-behavior: smooth.
     * We temporarily disable it or the browser may animate
     * the reset instead of actually starting at frame zero.
     */
    html.style.scrollBehavior =
      "auto";

    window.history.scrollRestoration =
      "manual";

    function reset() {
      window.scrollTo(
        0,
        0
      );
    }

    /*
     * Multiple frames are intentional.
     * Safari sometimes performs its own scroll restoration
     * during/after the first layout pass.
     */
    reset();

    const first =
      window.requestAnimationFrame(
        () => {
          reset();

          window.requestAnimationFrame(
            reset
          );
        }
      );

    const timer =
      window.setTimeout(
        () => {
          reset();

          html.style.scrollBehavior =
            oldScrollBehavior;
        },
        120
      );

    return () => {
      window.cancelAnimationFrame(
        first
      );

      window.clearTimeout(
        timer
      );

      html.style.scrollBehavior =
        oldScrollBehavior;
    };
  }, []);

  return null;
}

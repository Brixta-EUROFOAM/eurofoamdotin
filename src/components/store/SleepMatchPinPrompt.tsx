"use client";

import { useEffect } from "react";
import { useLocation } from "@/components/store/LocationProvider";

/** Reuses the existing skippable first-party PIN dialog. The modal is prompted
 *  once at the point visitors reach the finder, not when a crawler opens a page. */
export default function SleepMatchPinPrompt() {
  const { pin, info, openPicker, askOnce } = useLocation();
  useEffect(() => {
    const target = document.getElementById("sleepmatch");
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        askOnce();
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px 100px 0px", threshold: 0.05 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [askOnce]);

  return <div className="sm5-pin-prompt" role="group" aria-label="Delivery eligibility">
    <span>{info?.ok ? `Delivery to ${info.place?.city || info.pin} is available for checking` : pin ? `PIN ${pin}` : "Delivering in Assam and Meghalaya"}</span>
    <button type="button" onClick={openPicker}>{pin ? "Change PIN" : "Check delivery PIN"} <span aria-hidden="true">→</span></button>
  </div>;
}

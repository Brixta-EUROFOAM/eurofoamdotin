"use client";

import { useEffect, useRef } from "react";

/*
  Reading progress, sewn: a thread runs across the top of the page as you
  scroll, with a needle at its tip. Purely decorative (aria-hidden); it
  sits still for people who prefer reduced motion.
*/
export default function SewingThread() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.setProperty("--p", String(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="g-thread" ref={bar} aria-hidden="true">
      <div className="g-thread-sewn" />
      <svg className="g-thread-needle" viewBox="0 0 40 10" width="40" height="10">
        <path d="M0 5 H8" stroke="#b4321a" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 3.4 L35 4.6 Q39 5 35 5.4 L8 6.6 Q6 5 8 3.4Z" fill="#8a857d" />
        <ellipse cx="12" cy="5" rx="2.4" ry=".8" fill="#fff" />
      </svg>
    </div>
  );
}

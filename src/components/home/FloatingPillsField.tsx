"use client";

import { useEffect, useRef } from "react";

type Pill = {
  label: string;
  x: number;
  y: number;
  ampX: number;
  ampY: number;
  speed: number;
  phase: number;
  rotate: number;
  tone: string;
};

const PILLS: Pill[] = [
  {
    label: "PRESSURE RELIEF",
    x: 8,
    y: 11,
    ampX: 1.8,
    ampY: 1.4,
    speed: 0.52,
    phase: 0.0,
    rotate: -8,
    tone: "lime",
  },
  {
    label: "COOLER SLEEP",
    x: 30,
    y: 27,
    ampX: 2.3,
    ampY: 1.7,
    speed: 0.43,
    phase: 1.2,
    rotate: 6,
    tone: "blue",
  },
  {
    label: "EDGE SUPPORT",
    x: 52,
    y: 10,
    ampX: 1.6,
    ampY: 1.3,
    speed: 0.58,
    phase: 2.6,
    rotate: -4,
    tone: "pink",
  },
  {
    label: "LOW MOTION",
    x: 83,
    y: 29,
    ampX: 2.0,
    ampY: 1.6,
    speed: 0.49,
    phase: 4.1,
    rotate: 7,
    tone: "white",
  },
  {
    label: "100 NIGHT TRIAL",
    x: 55,
    y: 52,
    ampX: 1.9,
    ampY: 1.4,
    speed: 0.55,
    phase: 3.0,
    rotate: -3,
    tone: "orange",
  },
];

export default function FloatingPillsField() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;

      PILLS.forEach((pill, i) => {
        const el = refs.current[i];
        if (!el) return;

        const dx = Math.sin(t * pill.speed + pill.phase) * pill.ampX;
        const dy =
          Math.cos(t * (pill.speed * 0.9) + pill.phase * 1.15) * pill.ampY;

        const tilt =
          pill.rotate +
          Math.sin(t * (pill.speed * 0.55) + pill.phase) * 2.2;

        el.style.transform = `translate3d(${dx}vw, ${dy}vw, 0) rotate(${tilt}deg)`;
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="gadda-floating-pills" aria-hidden="true">
      {PILLS.map((pill, i) => (
        <div
          key={pill.label}
          ref={(node) => {
            refs.current[i] = node;
          }}
          className={`gadda-floating-pill gadda-floating-pill--${pill.tone}`}
          style={{
            left: `${pill.x}%`,
            top: `${pill.y}%`,
          }}
        >
          {pill.label}
        </div>
      ))}
    </div>
  );
}

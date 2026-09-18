"use client";

import { useEffect } from "react";

const CONFIG = {
  "PRESSURE RELIEF": {
    ampX: 52,
    ampY: 28,
    speed: 0.84,
    phase: 0.2,
    rotate: -8,
    depth: 0.014,
    mousePush: 70,
    z: 18,
  },

  "COOLER SLEEP": {
    ampX: 68,
    ampY: 36,
    speed: 0.74,
    phase: 1.4,
    rotate: 6,
    depth: -0.01,
    mousePush: 88,
    z: 18,
  },

  "EDGE SUPPORT": {
    ampX: 44,
    ampY: 31,
    speed: 0.96,
    phase: 2.6,
    rotate: -4,
    depth: 0.013,
    mousePush: 76,
    z: 18,
  },

  "LOW MOTION": {
    ampX: 56,
    ampY: 26,
    speed: 0.8,
    phase: 4.2,
    rotate: 7,
    depth: -0.013,
    mousePush: 82,
    z: 18,
  },

  "100 NIGHT TRIAL": {
    ampX: 40,
    ampY: 34,
    speed: 0.9,
    phase: 3.1,
    rotate: -3,
    depth: 0.018,
    mousePush: 96,
    z: 30,
  },
} as const;

type Label = keyof typeof CONFIG;

function clean(value: string | null) {
  return (value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

export default function FloatingPillMotion() {
  useEffect(() => {
    const labels =
      Object.keys(CONFIG) as Label[];

    let raf = 0;
    let start = performance.now();

    const mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      active: false,
    };

    function onMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }

    function onLeave() {
      mouse.active = false;
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    function findPills() {
      const candidates =
        Array.from(
          document.querySelectorAll<HTMLElement>(
            "div, span, button, a"
          )
        );

      return candidates
        .map((element) => ({
          element,
          label: clean(element.textContent),
        }))
        .filter(
          (
            item
          ): item is {
            element: HTMLElement;
            label: Label;
          } => {
            if (!labels.includes(item.label as Label)) {
              return false;
            }

            const children =
              Array.from(item.element.children);

            const childHasSameText =
              children.some(
                (child) =>
                  clean(child.textContent) === item.label
              );

            return !childHasSameText;
          }
        );
    }

    let pills = findPills();

    function prepareElements() {
      pills.forEach(({ element, label }) => {
        const c = CONFIG[label];

        element.style.willChange = "transform";
        element.style.transition = "none";
        element.style.position = element.style.position || "relative";
        element.style.zIndex = String(c.z);
        element.style.pointerEvents = "none";
      });

      /*
        Make sure the orange trial pill doesn't hide
        behind the illustration block.
      */
      const trial = pills.find(
        (p) => p.label === "100 NIGHT TRIAL"
      );

      if (trial) {
        trial.element.style.zIndex = "40";
        trial.element.style.filter = "drop-shadow(6px 6px 0 #111111)";
      }
    }

    if (!pills.length) {
      const timer = window.setTimeout(() => {
        pills = findPills();
        prepareElements();
      }, 400);

      return () => window.clearTimeout(timer);
    }

    prepareElements();

    function tick(now: number) {
      const t = (now - start) / 1000;
      const scroll = window.scrollY;

      pills.forEach(({ element, label }) => {
        const c = CONFIG[label];

        const rect = element.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        /*
          Base idle motion
        */
        const floatX =
          Math.sin(t * c.speed + c.phase) * c.ampX;

        const floatY =
          Math.cos(t * c.speed * 0.73 + c.phase * 1.3) * c.ampY;

        const wobble =
          Math.sin(t * c.speed * 0.55 + c.phase) * 3.2;

        const parallax =
          scroll * c.depth;

        /*
          Mouse chase effect:
          pills move AWAY from cursor if it gets near.
        */
        let pushX = 0;
        let pushY = 0;

        if (mouse.active) {
          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const dist = Math.hypot(dx, dy) || 1;

          const influenceRadius = 260;

          if (dist < influenceRadius) {
            const strength =
              (1 - dist / influenceRadius) * c.mousePush;

            pushX = (dx / dist) * strength;
            pushY = (dy / dist) * strength;
          }
        }

        /*
          Special nudge so 100 NIGHT TRIAL stays more visible.
        */
        let trialBiasX = 0;
        let trialBiasY = 0;

        if (label === "100 NIGHT TRIAL") {
          trialBiasX = -10;
          trialBiasY = -22;
        }

        element.style.transform =
          `translate3d(` +
          `${floatX + pushX + trialBiasX}px, ` +
          `${floatY + parallax + pushY + trialBiasY}px, 0) ` +
          `rotate(${c.rotate + wobble}deg)`;
      });

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    return () => {
      if (raf) {
        cancelAnimationFrame(raf);
      }

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return null;
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type LayerItem = {
  step: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  fallback: string;
};

const layers: LayerItem[] = [
  {
    step: "01",
    eyebrow: "FABRIC",
    title: "AirKnit Cover",
    body: "Soft-touch breathable top fabric designed for a clean first-touch feel.",
    image: "/layers/Layer1.png",
    fallback: "linear-gradient(180deg, #f8f3ea 0%, #eee6d8 100%)"
  },
  {
    step: "02",
    eyebrow: "COMFORT",
    title: "Pressure Relief Layer",
    body: "Responsive foam that cushions the body and reduces sharp pressure points.",
    image: "/layers/Layer2.png",
    fallback: "linear-gradient(180deg, #f4dfc6 0%, #e9cba9 100%)"
  },
  {
    step: "03",
    eyebrow: "SUPPORT",
    title: "Adaptive Transition Layer",
    body: "A stabilising layer that controls sink and guides the body into support.",
    image: "/layers/Layer3.png",
    fallback: "linear-gradient(180deg, #ff9b45 0%, #f57b19 100%)"
  },
  {
    step: "04",
    eyebrow: "CORE",
    title: "Structural Base Core",
    body: "The foundation that carries load, improves alignment and holds the mattress shape.",
    image: "/layers/Layer4.png",
    fallback: "linear-gradient(180deg, #2b2b2b 0%, #111111 100%)"
  }
];

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export default function LayerScrollStory() {
  const [active, setActive] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex = active;
        let bestRatio = 0;

        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-step-index") || 0);

          if (entry.isIntersecting && entry.intersectionRatio >= bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = index;
          }
        });

        if (bestRatio > 0) {
          setActive(bestIndex);
        }
      },
      {
        threshold: [0.35, 0.55, 0.75]
      }
    );

    cardRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [active]);

  const visualLayers = useMemo(() => {
    return layers.map((layer, index) => {
      const depth = layers.length - index;
      const progress = clamp((active - index) + 1, 0, 1);

      const y = index * 42 - progress * 48;
      const scale = 1 - index * 0.015 + progress * 0.02;
      const opacity = index <= active ? 1 : 0.86;
      const rotate = (index - active) * 0.4;

      return {
        ...layer,
        y,
        scale,
        opacity,
        rotate,
        z: depth
      };
    });
  }, [active]);

  return (
    <section className="bg-[#F7F5F0]">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D95F0E]">
            Mattress construction
          </p>
          <h2 className="mt-4 font-display text-5xl leading-[0.92] sm:text-6xl">
            Go beneath the surface.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink/60">
            Scroll through the build, layer by layer. The motion is quieter,
            cleaner and better blended into the homepage.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-6">
            {layers.map((layer, index) => {
              const isActive = index === active;

              return (
                <div
                  key={layer.step}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  data-step-index={index}
                  className={`rounded-[2rem] border p-7 transition-all duration-300 ${
                    isActive
                      ? "border-[#F4B27A] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.06)]"
                      : "border-ink/8 bg-white/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black tracking-[0.2em] text-[#D95F0E]">
                      {layer.step}
                    </span>
                    <span className="h-px w-10 bg-[#F4B27A]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.24em] text-ink/45">
                      {layer.eyebrow}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-3xl sm:text-4xl">
                    {layer.title}
                  </h3>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-ink/60 sm:text-base">
                    {layer.body}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="rounded-[2.4rem] border border-ink/8 bg-[radial-gradient(circle_at_50%_30%,rgba(255,122,0,0.08),transparent_35%),linear-gradient(180deg,#ffffff_0%,#faf7f1_100%)] p-6 shadow-[0_30px_80px_rgba(31,20,8,0.08)] sm:p-8">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-transparent">
                {visualLayers.map((layer, index) => (
                  <div
                    key={layer.step}
                    className="absolute left-[7%] right-[7%] top-[16%] mx-auto"
                    style={{
                      zIndex: layer.z,
                      transform: `translateY(${layer.y}px) scale(${layer.scale}) rotateX(0deg) rotateZ(${layer.rotate}deg)`,
                      opacity: layer.opacity,
                      transition: "transform 500ms cubic-bezier(.22,.61,.36,1), opacity 350ms ease"
                    }}
                  >
                    <div
                      className="relative mx-auto h-[72px] w-full rounded-[999px] shadow-[0_18px_32px_rgba(0,0,0,0.16)] md:h-[82px]"
                      style={{ background: layer.fallback }}
                    >
                      <img
                        src={layer.image}
                        alt={layer.title}
                        className="absolute inset-0 h-full w-full rounded-[999px] object-contain"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div className="absolute inset-x-[14%] bottom-[10%] h-10 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.14),rgba(0,0,0,0))] blur-xl" />
              </div>

              <div className="mt-5 flex items-center justify-between rounded-[1.4rem] border border-ink/8 bg-white/80 px-5 py-4 backdrop-blur">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D95F0E]">
                    Active layer
                  </p>
                  <p className="mt-2 font-display text-2xl">
                    {layers[active].title}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {layers.map((layer, index) => (
                    <button
                      key={layer.step}
                      type="button"
                      onClick={() => setActive(index)}
                      aria-label={`Show ${layer.title}`}
                      className={`h-2.5 rounded-full transition-all ${
                        index === active ? "w-8 bg-[#FF7A00]" : "w-2.5 bg-ink/18"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

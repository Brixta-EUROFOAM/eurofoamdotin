"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  slug: string;
  name: string;
  image: string;
  heroImage?: string;
  gallery?: string[];
  shortDescription?: string;
};

type Slide = {
  key: string;
  eyebrow: string;
  headline: string;
  body: string;
  href: string;
  image: string;
};

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path
        d="M20 14.5A8.5 8.5 0 0 1 9.5 4 9 9 0 1 0 20 14.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path
        d="M12 3l7 3v5c0 4.9-2.9 8.9-7 10-4.1-1.1-7-5.1-7-10V6l7-3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M1.5 6.5h12v8h-12z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 9.5h4l2.5 2.5v2.5h-6.5z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="1.7" />
      <circle cx="18" cy="18" r="1.7" />
    </svg>
  );
}

function getImage(product?: Product, index = 0) {
  if (!product) return "";
  return product.heroImage || product.gallery?.[0] || product.image || "";
}

function buildSlides(products: Product[]): Slide[] {
  const source = products.slice(0, 3);

  if (!source.length) {
    return [
      {
        key: "fallback-1",
        eyebrow: "BETTER SLEEP LIVES HERE",
        headline: "Find the mattress\nthat feels right.",
        body: "Contour, support and quiet comfort built to match the way you actually sleep.",
        href: "/mattresses",
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop"
      }
    ];
  }

  const copy = [
    {
      eyebrow: "BETTER SLEEP LIVES HERE",
      headline: "Find the mattress\nthat feels right.",
      body: "Contour, support and quiet comfort built to match the way you actually sleep."
    },
    {
      eyebrow: "CRAFTED FOR CALMER NIGHTS",
      headline: "Support where you need it.\nComfort where you feel it.",
      body: "Layered construction that eases pressure, steadies posture and keeps the surface beautifully composed."
    },
    {
      eyebrow: "REFINED EVERYDAY COMFORT",
      headline: "A cleaner way\nto choose better sleep.",
      body: "Clear materials, considered feel profiles and a buying experience that feels as polished as the product."
    }
  ];

  return source.map((product, index) => ({
    key: product.slug || String(index),
    eyebrow: copy[index]?.eyebrow || "EUROFOAM",
    headline: copy[index]?.headline || product.name,
    body: copy[index]?.body || product.shortDescription || "Thoughtful comfort, built with balance and lasting support.",
    href: product.slug ? `/mattresses/${product.slug}` : "/mattresses",
    image: getImage(product, index)
  }));
}

export default function PremiumEditorialHero({
  site,
  products
}: {
  site: any;
  products: Product[];
}) {
  const slides = useMemo(() => buildSlides(products), [products]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const current = slides[active];

  const prev = () => {
    setActive((currentIndex) =>
      currentIndex === 0 ? slides.length - 1 : currentIndex - 1
    );
  };

  const next = () => {
    setActive((currentIndex) =>
      currentIndex === slides.length - 1 ? 0 : currentIndex + 1
    );
  };

  return (
    <section className="bg-[#F9F8F6]">
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-8 lg:px-8 lg:pb-10 lg:pt-10">
        <div className="overflow-hidden rounded-[12px] border border-black/10 bg-[#0D0D0D] text-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
          <div className="relative min-h-[560px] lg:min-h-[620px]">
            <Link
              href={current.href}
              className="grid min-h-[560px] lg:min-h-[620px] lg:grid-cols-[0.9fr_1.1fr]"
            >
              <div className="relative z-10 flex items-center px-8 py-10 sm:px-12 lg:px-16">
                <div className="max-w-[34rem]">
                  <p className="text-[11px] font-semibold tracking-[0.38em] text-white/70">
                    EUROFOAM
                  </p>

                  <div className="mt-8 flex items-center gap-5">
                    <span className="h-px w-12 bg-white/35" />
                    <p className="text-[11px] font-medium tracking-[0.38em] text-[#C8B6A0]">
                      {current.eyebrow}
                    </p>
                  </div>

                  <h1 className="mt-8 whitespace-pre-line text-[clamp(3rem,6vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.05em] text-white">
                    {current.headline}
                  </h1>

                  <p className="mt-7 max-w-xl text-lg leading-8 text-white/72">
                    {current.body}
                  </p>

                  <div className="mt-10">
                    <span className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[#111111] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(255,255,255,0.12)]">
                      Explore this mattress
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[360px] overflow-hidden lg:min-h-[620px]">
                <img
                  src={current.image}
                  alt={site?.brandName || "Eurofoam mattress"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,13,13,0.72)_0%,rgba(13,13,13,0.22)_30%,rgba(13,13,13,0.18)_100%)] lg:bg-[linear-gradient(90deg,rgba(13,13,13,0)_0%,rgba(13,13,13,0.06)_38%,rgba(13,13,13,0.28)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(255,255,255,0.12),transparent_34%)]" />

                <div className="absolute right-8 top-8 hidden lg:block">
                  <div className="text-right text-[11px] font-medium tracking-[0.34em] text-[#D7C8B7]">
                    <div>REST</div>
                    <div className="mt-2">REFRESH</div>
                    <div className="mt-2">BELONG</div>
                  </div>
                </div>

                <div className="absolute bottom-8 right-8 hidden lg:block">
                  <div className="text-right text-[11px] font-medium tracking-[0.34em] text-white/72">
                    <div>A CALMER</div>
                    <div className="mt-2">BRIGHTER YOU</div>
                  </div>
                </div>
              </div>
            </Link>

            {slides.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={prev}
                  className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/22 bg-black/18 text-white backdrop-blur transition hover:bg-black/34 lg:left-8"
                >
                  <ChevronLeft />
                </button>

                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={next}
                  className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/22 bg-black/18 text-white backdrop-blur transition hover:bg-black/34 lg:right-8"
                >
                  <ChevronRight />
                </button>
              </>
            ) : null}

            {slides.length > 1 ? (
              <div className="absolute bottom-8 left-8 z-20 flex items-center gap-3 lg:left-16">
                {slides.map((slide, index) => (
                  <button
                    key={slide.key}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => setActive(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === active ? "w-7 bg-white" : "w-2.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden border-x border-b border-black/10 bg-white">
          <div className="grid md:grid-cols-3">
            {[
              {
                icon: <MoonIcon />,
                title: "100 NIGHT TRIAL",
                body: "Sleep on it at home and decide with clarity."
              },
              {
                icon: <ShieldIcon />,
                title: "10+ YEAR WARRANTY",
                body: "Built to hold its form and comfort over time."
              },
              {
                icon: <TruckIcon />,
                title: "FREE SHIPPING",
                body: "Delivered directly to your door."
              }
            ].map((item, index) => (
              <div
                key={item.title}
                className={`flex items-start gap-5 px-6 py-7 lg:px-10 ${
                  index !== 2 ? "border-b border-black/8 md:border-b-0 md:border-r" : ""
                }`}
              >
                <div className="pt-1 text-[#111111]">{item.icon}</div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.34em] text-[#111111]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/58">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[12px] border border-black/10 bg-[#F9F8F6] shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-center px-8 py-10 sm:px-12 lg:px-16 lg:py-16">
              <div className="max-w-[30rem]">
                <p className="text-[11px] font-semibold tracking-[0.34em] text-[#A58D73]">
                  EUROFOAM VALUE
                </p>

                <h2 className="mt-6 text-[clamp(2.6rem,5vw,4.8rem)] font-medium leading-[0.95] tracking-[-0.05em] text-[#111111]">
                  Direct comfort.
                  <br />
                  Clearer decisions.
                </h2>

                <p className="mt-7 text-lg leading-8 text-black/62">
                  From the first touch to the support underneath, every detail is
                  designed to make choosing well feel simple.
                </p>

                <Link
                  href="/mattresses"
                  className="mt-9 inline-flex items-center gap-3 border-b border-[#111111] pb-2 text-sm font-semibold text-[#111111] transition hover:gap-4"
                >
                  Explore our mattresses
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden lg:min-h-[520px]">
              <img
                src={products?.[1]?.image || products?.[0]?.image || current.image}
                alt="Eurofoam mattress detail"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(249,248,246,0.22)_0%,rgba(249,248,246,0.02)_34%,rgba(0,0,0,0.06)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.52),transparent_26%)]" />

              <div className="absolute right-8 top-8 hidden lg:block">
                <div className="text-right text-[11px] font-medium tracking-[0.34em] text-[#8E7C67]">
                  <div>MORE</div>
                  <div className="mt-2">RESTFUL</div>
                  <div className="mt-2">TOMORROWS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

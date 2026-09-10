"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import type {
  HeroSlide,
  Mattress,
  SiteSettings
} from "@/lib/catalog";


function Arrow({
  direction
}: {
  direction: "left" | "right";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {direction === "left" ? (
        <path
          d="M15 18 9 12l6-6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="m9 18 6-6-6-6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}


export default function HeroSlideshow({
  site,
  products
}: {
  site: SiteSettings;
  products: Mattress[];
}) {
  const fallback: HeroSlide = useMemo(
    () => ({
      id: "legacy-hero",
      image: site.heroImage,
      imageAlt: site.brandName,
      href: products[0]
        ? `/mattresses/${products[0].slug}`
        : "/mattresses",
      eyebrow: site.heroEyebrow,
      title: site.heroTitle,
      body: site.heroBody,
      ctaLabel: site.primaryCtaLabel || "Discover",
      textTone: "light",
      contentAlign: "left",
      imagePosition: "50% 50%",
      enabled: true
    }),
    [site, products]
  );

  const slides = useMemo(() => {
    const configured =
      (site.heroSlides || []).filter(
        (slide) =>
          slide.enabled !== false &&
          Boolean(slide.image?.trim()) &&
          Boolean(slide.href?.trim())
      );

    return configured.length
      ? configured
      : [fallback];
  }, [site.heroSlides, fallback]);

  const [active, setActive] =
    useState(0);

  const [paused, setPaused] =
    useState(false);

  const [reducedMotion, setReducedMotion] =
    useState(false);

  const touchStartX =
    useRef<number | null>(null);

  useEffect(() => {
    if (active >= slides.length) {
      setActive(0);
    }
  }, [slides.length, active]);

  useEffect(() => {
    const media =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    function sync() {
      setReducedMotion(media.matches);
    }

    sync();

    media.addEventListener?.(
      "change",
      sync
    );

    return () =>
      media.removeEventListener?.(
        "change",
        sync
      );
  }, []);

  useEffect(() => {
    if (
      paused ||
      reducedMotion ||
      slides.length <= 1
    ) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        setActive(
          (current) =>
            (current + 1) %
            slides.length
        );
      },
      7000
    );

    return () =>
      window.clearTimeout(timer);
  }, [
    active,
    paused,
    reducedMotion,
    slides.length
  ]);

  function previous() {
    setActive(
      (current) =>
        (
          current -
          1 +
          slides.length
        ) %
        slides.length
    );
  }

  function next() {
    setActive(
      (current) =>
        (current + 1) %
        slides.length
    );
  }

  function handleTouchStart(
    event: React.TouchEvent
  ) {
    touchStartX.current =
      event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(
    event: React.TouchEvent
  ) {
    if (touchStartX.current === null) {
      return;
    }

    const end =
      event.changedTouches[0]?.clientX;

    if (end === undefined) return;

    const delta =
      end - touchStartX.current;

    touchStartX.current = null;

    if (Math.abs(delta) < 45) {
      return;
    }

    if (delta > 0) {
      previous();
    } else {
      next();
    }
  }

  return (
    <section
      className="relative isolate overflow-hidden bg-[#F7F5F0]"
      aria-roledescription="carousel"
      aria-label="Featured Eurofoam mattresses"
      tabIndex={0}
      onMouseEnter={() =>
        setPaused(true)
      }
      onMouseLeave={() =>
        setPaused(false)
      }
      onFocusCapture={() =>
        setPaused(true)
      }
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node
          )
        ) {
          setPaused(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          previous();
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          next();
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative min-h-[72svh] md:min-h-[78svh] lg:min-h-[82svh]">
        {slides.map(
          (slide, index) => {
            const isActive =
              index === active;

            const lightText =
              slide.textTone !== "dark";

            const centered =
              slide.contentAlign ===
              "center";

            return (
              <Link
                key={slide.id}
                href={slide.href}
                aria-label={
                  slide.title
                    ? `${slide.title}. ${slide.ctaLabel || "Open"}`
                    : "Open featured Eurofoam mattress"
                }
                aria-hidden={
                  !isActive
                }
                tabIndex={
                  isActive
                    ? 0
                    : -1
                }
                className={`absolute inset-0 ${
                  isActive
                    ? "pointer-events-auto z-10"
                    : "pointer-events-none z-0"
                }`}
                style={{
                  opacity:
                    isActive
                      ? 1
                      : 0,

                  transition:
                    reducedMotion
                      ? "opacity 200ms ease"
                      : "opacity 1000ms cubic-bezier(.22,.61,.36,1)"
                }}
              >
                {/* IMAGE */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={slide.image}
                    alt={
                      slide.imageAlt ||
                      slide.title
                    }
                    loading={
                      index === 0
                        ? "eager"
                        : "lazy"
                    }
                    fetchPriority={
                      index === 0
                        ? "high"
                        : "auto"
                    }
                    decoding="async"
                    draggable={false}
                    className="h-full w-full select-none object-cover"
                    style={{
                      objectPosition:
                        slide.imagePosition ||
                        "50% 50%",

                      transform:
                        isActive &&
                        !reducedMotion
                          ? "scale(1)"
                          : "scale(1.035)",

                      transition:
                        reducedMotion
                          ? "none"
                          : "transform 8s cubic-bezier(.18,.7,.25,1)"
                    }}
                  />
                </div>


                {/* HIGH-END SCRIM */}
                {lightText ? (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          centered
                            ? `
                              linear-gradient(
                                180deg,
                                rgba(0,0,0,.18) 0%,
                                rgba(0,0,0,.02) 45%,
                                rgba(0,0,0,.32) 100%
                              )
                            `
                            : `
                              linear-gradient(
                                90deg,
                                rgba(0,0,0,.55) 0%,
                                rgba(0,0,0,.30) 29%,
                                rgba(0,0,0,.05) 58%,
                                transparent 78%
                              )
                            `
                      }}
                    />

                    <div
                      className="absolute inset-x-0 bottom-0 h-[34%]"
                      style={{
                        background:
                          "linear-gradient(to top,rgba(0,0,0,.26),transparent)"
                      }}
                    />
                  </>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        centered
                          ? `
                            linear-gradient(
                              180deg,
                              rgba(255,255,255,.18),
                              transparent 46%,
                              rgba(255,255,255,.22)
                            )
                          `
                          : `
                            linear-gradient(
                              90deg,
                              rgba(255,255,255,.78) 0%,
                              rgba(255,255,255,.47) 31%,
                              rgba(255,255,255,.06) 61%,
                              transparent 82%
                            )
                          `
                    }}
                  />
                )}


                {/* CONTENT */}
                <div
                  className={`relative mx-auto flex min-h-[72svh] max-w-[1500px] px-6 py-16 md:min-h-[78svh] md:px-10 lg:min-h-[82svh] lg:px-14 ${
                    centered
                      ? "items-center justify-center text-center"
                      : "items-end pb-[12vh] md:items-center md:pb-16"
                  }`}
                >
                  <div
                    className={`${
                      centered
                        ? "mx-auto max-w-[850px]"
                        : "max-w-[610px]"
                    } ${
                      lightText
                        ? "text-white"
                        : "text-[#171717]"
                    }`}
                    style={{
                      transform:
                        isActive
                          ? "translateY(0)"
                          : "translateY(18px)",

                      opacity:
                        isActive
                          ? 1
                          : 0,

                      transition:
                        reducedMotion
                          ? "none"
                          : "opacity 900ms ease 150ms, transform 1000ms cubic-bezier(.22,.61,.36,1) 150ms"
                    }}
                  >
                    {slide.eyebrow ? (
                      <div
                        className={`text-[10px] font-black uppercase tracking-[0.24em] md:text-xs ${
                          lightText
                            ? "text-white/72"
                            : "text-ink/50"
                        }`}
                      >
                        {slide.eyebrow}
                      </div>
                    ) : null}

                    <h1 className="mt-4 font-display text-[clamp(3.25rem,6vw,6.8rem)] leading-[0.86] tracking-[-0.055em]">
                      {slide.title}
                    </h1>

                    {slide.body ? (
                      <p
                        className={`mt-6 max-w-[570px] text-sm leading-6 md:text-lg md:leading-8 ${
                          centered
                            ? "mx-auto"
                            : ""
                        } ${
                          lightText
                            ? "text-white/72"
                            : "text-ink/60"
                        }`}
                      >
                        {slide.body}
                      </p>
                    ) : null}

                    {slide.ctaLabel ? (
                      <span
                        className={`mt-7 inline-flex items-center gap-3 rounded-full px-5 py-3 text-xs font-bold backdrop-blur-md md:px-6 md:py-3.5 md:text-sm ${
                          lightText
                            ? "border border-white/35 bg-white/12 text-white"
                            : "border border-black/15 bg-white/55 text-ink"
                        }`}
                      >
                        {slide.ctaLabel}

                        <span
                          aria-hidden="true"
                          className="text-base"
                        >
                          →
                        </span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          }
        )}


        {/* CONTROLS */}
        {slides.length > 1 ? (
          <>
            <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/18 px-3 py-2 backdrop-blur-xl">
              {slides.map(
                (slide, index) => (
                  <button
                    key={`dot-${slide.id}`}
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setActive(index);
                    }}
                    aria-label={`Show slide ${index + 1}`}
                    aria-current={
                      index === active
                        ? "true"
                        : undefined
                    }
                    className="flex h-4 items-center justify-center"
                  >
                    <span
                      className={`block h-[4px] rounded-full transition-all duration-500 ${
                        index === active
                          ? "w-8 bg-white"
                          : "w-[4px] bg-white/55"
                      }`}
                    />
                  </button>
                )
              )}
            </div>


            <div className="absolute bottom-5 right-5 z-30 hidden items-center gap-2 md:flex lg:right-8">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  previous();
                }}
                aria-label="Previous slide"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/16 text-white backdrop-blur-xl transition hover:bg-black/30"
              >
                <Arrow direction="left" />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  next();
                }}
                aria-label="Next slide"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/16 text-white backdrop-blur-xl transition hover:bg-black/30"
              >
                <Arrow direction="right" />
              </button>
            </div>
          </>
        ) : null}


        {/* HAIRLINE */}
        <div className="absolute inset-x-0 bottom-0 z-30 h-px bg-black/10" />
      </div>

      <span
        className="sr-only"
        aria-live="polite"
      >
        Slide {active + 1} of {slides.length}:{" "}
        {slides[active]?.title}
      </span>
    </section>
  );
}

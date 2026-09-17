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


function clamp(
  value: number,
  min = 0,
  max = 1
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}


function range(
  value: number,
  start: number,
  end: number
) {
  if (start === end) {
    return 0;
  }

  return clamp(
    (value - start) /
    (end - start)
  );
}


function smooth(value: number) {
  const t = clamp(value);

  return (
    t *
    t *
    (3 - 2 * t)
  );
}


function smoother(value: number) {
  const t = clamp(value);

  return (
    t *
    t *
    t *
    (
      t *
      (
        t * 6 - 15
      )
      + 10
    )
  );
}


function Arrow({
  side
}: {
  side: "left" | "right";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      {side === "left" ? (
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


export default function CinematicHomeHero({
  site,
  products
}: {
  site: SiteSettings;
  products: Mattress[];
}) {
  const rootRef =
    useRef<HTMLElement | null>(null);

  const raf =
    useRef<number | null>(null);

  const touchStart =
    useRef<number | null>(null);

  const [progress, setProgress] =
    useState(0);

  const [inView, setInView] =
    useState(true);

  const [active, setActive] =
    useState(0);

  const [paused, setPaused] =
    useState(false);

  const [reducedMotion, setReducedMotion] =
    useState(false);

  const fallback =
    useMemo<HeroSlide>(
      () => ({
        id: "fallback",
        image:
          site.heroImage ||
          products[0]?.image ||
          "",
        imageAlt:
          site.brandName,
        href:
          products[0]
            ? `/mattresses/${products[0].slug}`
            : "/mattresses",
        eyebrow:
          site.heroEyebrow ||
          "EUROFOAM",
        title:
          site.heroTitle ||
          "Sleep, properly considered.",
        body:
          site.heroBody ||
          "",
        ctaLabel:
          site.primaryCtaLabel ||
          "Discover",
        textTone: "light",
        contentAlign: "left",
        imagePosition: "50% 50%",
        enabled: true
      }),
      [site, products]
    );


  const slides =
    useMemo(
      () => {
        const configured =
          (
            site.heroSlides ||
            []
          ).filter(
            (slide) =>
              slide.enabled !== false &&
              Boolean(
                slide.image?.trim()
              ) &&
              Boolean(
                slide.href?.trim()
              )
          );

        return configured.length
          ? configured
          : [fallback];
      },
      [
        site.heroSlides,
        fallback
      ]
    );


  useEffect(() => {
    const query =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    function update() {
      setReducedMotion(
        query.matches
      );
    }

    update();

    query.addEventListener?.(
      "change",
      update
    );

    return () =>
      query.removeEventListener?.(
        "change",
        update
      );
  }, []);


  useEffect(() => {
    if (reducedMotion) {
      setProgress(1);
      return;
    }

    function calculate() {
      raf.current = null;

      const root =
        rootRef.current;

      if (!root) return;

      const rect =
        root.getBoundingClientRect();

      const travel =
        root.offsetHeight -
        window.innerHeight;

      const passed =
        -rect.top;

      const next =
        travel > 0
          ? clamp(
              passed / travel
            )
          : 0;

      setProgress(next);

      setInView(
        rect.bottom > 0 &&
        rect.top <
          window.innerHeight
      );
    }

    function request() {
      if (
        raf.current !== null
      ) {
        return;
      }

      raf.current =
        requestAnimationFrame(
          calculate
        );
    }

    calculate();

    window.addEventListener(
      "scroll",
      request,
      {
        passive: true
      }
    );

    window.addEventListener(
      "resize",
      request
    );

    window.addEventListener(
      "pageshow",
      request
    );

    return () => {
      window.removeEventListener(
        "scroll",
        request
      );

      window.removeEventListener(
        "resize",
        request
      );

      window.removeEventListener(
        "pageshow",
        request
      );

      if (
        raf.current !== null
      ) {
        cancelAnimationFrame(
          raf.current
        );
      }
    };
  }, [reducedMotion]);


  /*
   * Slider begins auto-playing only once
   * the scroll-controlled intro has settled.
   */
  const sliderReady =
    reducedMotion ||
    progress > 0.54;


  useEffect(() => {
    if (
      paused ||
      !sliderReady ||
      !inView ||
      slides.length < 2
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setActive(
            (current) =>
              (
                current + 1
              ) %
              slides.length
          );
        },
        7200
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    active,
    paused,
    sliderReady,
    inView,
    slides.length
  ]);


  /*
   * Quietly preload the next campaign.
   */
  useEffect(() => {
    if (
      slides.length < 2
    ) {
      return;
    }

    const next =
      slides[
        (
          active + 1
        ) %
        slides.length
      ];

    if (!next?.image) {
      return;
    }

    const preload =
      new Image();

    preload.src =
      next.image;
  }, [
    active,
    slides
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
        (
          current + 1
        ) %
        slides.length
    );
  }


  /*
   * ========================================================
   * INTRO TIMELINE
   *
   * 0.00
   * large cream field
   * image exists as a floating cinematic window
   *
   * 0.10
   * camera begins approaching
   *
   * 0.40
   * image window nearly fills viewport
   *
   * 0.52
   * full-bleed slider is established
   *
   * 0.60+
   * normal interactive hero state
   * ========================================================
   */


  const expansion =
    reducedMotion
      ? 1
      : smoother(
          range(
            progress,
            0.04,
            0.49
          )
        );


  const introCopyOut =
    reducedMotion
      ? 1
      : smooth(
          range(
            progress,
            0.12,
            0.36
          )
        );


  const campaignCopyIn =
    reducedMotion
      ? 1
      : smoother(
          range(
            progress,
            0.35,
            0.56
          )
        );


  const controlsIn =
    reducedMotion
      ? 1
      : smooth(
          range(
            progress,
            0.48,
            0.60
          )
        );


  const backgroundExit =
    smooth(
      range(
        progress,
        0.14,
        0.46
      )
    );


  /*
   * Floating-window dimensions.
   * They interpolate continuously into 0.
   */
  const horizontalInset =
    (
      1 - expansion
    ) *
    11;


  const topInset =
    (
      1 - expansion
    ) *
    15;


  const bottomInset =
    (
      1 - expansion
    ) *
    11;


  const radius =
    (
      1 - expansion
    ) *
    42;


  const imageZoom =
    1.075 -
    expansion * 0.075;


  const current =
    slides[
      Math.min(
        active,
        slides.length - 1
      )
    ];


  function handleTouchStart(
    event: React.TouchEvent
  ) {
    touchStart.current =
      event.touches[0]
        ?.clientX ??
      null;
  }


  function handleTouchEnd(
    event: React.TouchEvent
  ) {
    if (
      touchStart.current ===
      null
    ) {
      return;
    }

    const end =
      event.changedTouches[0]
        ?.clientX;

    if (
      end === undefined
    ) {
      return;
    }

    const delta =
      end -
      touchStart.current;

    touchStart.current =
      null;

    if (
      Math.abs(delta) <
      48
    ) {
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
      ref={rootRef}
      className="relative bg-white"
      style={{
        height: reducedMotion
          ? "100svh"
          : "185svh"
      }}
      aria-label="Eurofoam featured mattresses"
    >
      <div
        className="sticky top-0 h-[100svh] overflow-hidden bg-[#FAF8F4]"
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
        onBlurCapture={(
          event
        ) => {
          if (
            !event.currentTarget.contains(
              event.relatedTarget instanceof Node
                ? event.relatedTarget
                : null
            )
          ) {
            setPaused(false);
          }
        }}
        onKeyDown={(
          event
        ) => {
          if (
            !sliderReady
          ) {
            return;
          }

          if (
            event.key ===
            "ArrowLeft"
          ) {
            event.preventDefault();
            previous();
          }

          if (
            event.key ===
            "ArrowRight"
          ) {
            event.preventDefault();
            next();
          }
        }}
        onTouchStart={
          handleTouchStart
        }
        onTouchEnd={
          handleTouchEnd
        }
      >

        {/* =================================================
            PAGE FIELD BEFORE THE IMAGE TAKES OVER
        ================================================= */}

        <div
          className="absolute inset-0"
          style={{
            opacity:
              1 -
              backgroundExit,

            background: `
              radial-gradient(
                circle at 50% 46%,
                rgba(
                  255,
                  122,
                  0,
                  .065
                ),
                transparent 35%
              ),
              linear-gradient(
                180deg,
                #FFFFFF 0%,
                #FBF9F5 100%
              )
            `
          }}
        />


        {/* =================================================
            MINIMAL INTRO COPY

            Notice: not plastered across the photo.
        ================================================= */}

        <div
          className="pointer-events-none absolute inset-x-0 top-[7vh] z-30 px-6 text-center md:top-[8vh]"
          style={{
            opacity:
              1 -
              introCopyOut,

            transform: `
              translateY(
                ${
                  -introCopyOut *
                  22
                }px
              )
            `
          }}
        >
          <div className="text-[9px] font-black uppercase tracking-[0.30em] text-[#D95F0E] md:text-[10px]">
            EUROFOAM
          </div>

          <div className="mt-3 font-display text-[clamp(2rem,4vw,4.4rem)] leading-[0.94] tracking-[-0.045em] text-ink">
            {site.tagline}
          </div>

          <div className="mx-auto mt-5 flex items-center justify-center gap-3 text-[8px] font-black uppercase tracking-[0.20em] text-ink/30">
            <span>
              Scroll
            </span>

            <span className="h-px w-9 bg-[#FF7A00]/45" />

            <span>
              Discover
            </span>
          </div>
        </div>


        {/* =================================================
            THE IMAGE WINDOW

            This is the core effect:
            it physically expands into the viewport.
        ================================================= */}

        <div
          className="absolute z-10 overflow-hidden bg-[#111]"
          style={{
            left:
              `${horizontalInset}vw`,

            right:
              `${horizontalInset}vw`,

            top:
              `${topInset}vh`,

            bottom:
              `${bottomInset}vh`,

            borderRadius:
              `${radius}px`,

            boxShadow:
              expansion < 0.97
                ? `
                  0
                  ${28 - expansion * 20}px
                  ${85 - expansion * 45}px
                  rgba(
                    30,
                    23,
                    17,
                    ${
                      0.17 -
                      expansion * 0.09
                    }
                  )
                `
                : "none",

            transition:
              reducedMotion
                ? "none"
                : "border-radius 80ms linear"
          }}
        >

          {/* ===============================================
              ACTUAL SLIDES
          =============================================== */}

          {slides.map(
            (
              slide,
              index
            ) => {
              const isActive =
                index ===
                active;

              const light =
                slide.textTone !==
                "dark";

              const centered =
                slide.contentAlign ===
                "center";

              return (
                <Link
                  key={slide.id}
                  href={
                    slide.href
                  }
                  aria-hidden={
                    !isActive
                  }
                  tabIndex={
                    isActive &&
                    sliderReady
                      ? 0
                      : -1
                  }
                  aria-label={
                    `${slide.title}. ${
                      slide.ctaLabel ||
                      "View"
                    }`
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
                        ? "opacity 150ms ease"
                        : `
                          opacity
                          950ms
                          cubic-bezier(
                            .22,
                            .61,
                            .36,
                            1
                          )
                        `
                  }}
                >

                  {/* IMAGE */}

                  <img
                    src={
                      slide.image
                    }
                    alt={
                      slide.imageAlt ||
                      slide.title
                    }
                    loading={
                      index === 0
                        ? "eager"
                        : "lazy"
                    }
                    decoding="async"
                    draggable={false}
                    className="absolute inset-0 h-full w-full select-none object-cover"
                    style={{
                      objectPosition:
                        slide.imagePosition ||
                        "50% 50%",

                      transform: `
                        scale(
                          ${
                            imageZoom +
                            (
                              isActive &&
                              sliderReady
                                ? 0
                                : 0.01
                            )
                          }
                        )
                        translate3d(
                          0,
                          ${
                            (
                              1 -
                              expansion
                            ) *
                            -1.4
                          }%,
                          0
                        )
                      `,

                      transition:
                        reducedMotion
                          ? "none"
                          : `
                            transform
                            7000ms
                            cubic-bezier(
                              .20,
                              .72,
                              .28,
                              1
                            )
                          `
                    }}
                  />


                  {/* CINEMATIC IMAGE TREATMENT */}

                  {light ? (
                    <>
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            centered
                              ? `
                                linear-gradient(
                                  180deg,
                                  rgba(
                                    0,
                                    0,
                                    0,
                                    .16
                                  ),
                                  rgba(
                                    0,
                                    0,
                                    0,
                                    .01
                                  )
                                  43%,
                                  rgba(
                                    0,
                                    0,
                                    0,
                                    .31
                                  )
                                )
                              `
                              : `
                                linear-gradient(
                                  90deg,
                                  rgba(
                                    0,
                                    0,
                                    0,
                                    .55
                                  )
                                  0%,
                                  rgba(
                                    0,
                                    0,
                                    0,
                                    .32
                                  )
                                  27%,
                                  rgba(
                                    0,
                                    0,
                                    0,
                                    .08
                                  )
                                  55%,
                                  transparent
                                  78%
                                )
                              `
                        }}
                      />

                      <div
                        className="absolute inset-x-0 bottom-0 h-[34%]"
                        style={{
                          background: `
                            linear-gradient(
                              to top,
                              rgba(
                                0,
                                0,
                                0,
                                .26
                              ),
                              transparent
                            )
                          `
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
                                rgba(
                                  255,
                                  255,
                                  255,
                                  .19
                                ),
                                transparent
                                48%,
                                rgba(
                                  255,
                                  255,
                                  255,
                                  .15
                                )
                              )
                            `
                            : `
                              linear-gradient(
                                90deg,
                                rgba(
                                  255,
                                  255,
                                  255,
                                  .80
                                )
                                0%,
                                rgba(
                                  255,
                                  255,
                                  255,
                                  .48
                                )
                                31%,
                                rgba(
                                  255,
                                  255,
                                  255,
                                  .04
                                )
                                63%,
                                transparent
                                83%
                              )
                            `
                      }}
                    />
                  )}


                  {/* =======================================
                      CAMPAIGN COPY

                      Deliberately appears late.
                  ======================================= */}

                  <div
                    className={`relative z-20 flex h-full px-7 md:px-12 lg:px-[7vw] ${
                      centered
                        ? "items-center justify-center text-center"
                        : "items-end pb-[13vh] md:items-center md:pb-0"
                    }`}
                    style={{
                      opacity:
                        isActive
                          ? campaignCopyIn
                          : 0
                    }}
                  >
                    <div
                      className={
                        centered
                          ? "mx-auto max-w-[900px]"
                          : "max-w-[610px]"
                      }
                      style={{
                        transform: `
                          translateY(
                            ${
                              (
                                1 -
                                campaignCopyIn
                              ) *
                              24
                            }px
                          )
                        `
                      }}
                    >
                      {slide.eyebrow ? (
                        <div
                          className={`text-[9px] font-black uppercase tracking-[0.27em] md:text-[11px] ${
                            light
                              ? "text-white/68"
                              : "text-ink/50"
                          }`}
                        >
                          {
                            slide.eyebrow
                          }
                        </div>
                      ) : null}


                      <h1
                        className={`mt-4 font-display text-[clamp(3.5rem,6.7vw,7.5rem)] leading-[0.83] tracking-[-0.06em] ${
                          light
                            ? "text-white"
                            : "text-[#171717]"
                        }`}
                      >
                        {
                          slide.title
                        }
                      </h1>


                      {slide.body ? (
                        <p
                          className={`mt-6 max-w-[560px] text-sm leading-6 md:text-base md:leading-7 ${
                            centered
                              ? "mx-auto"
                              : ""
                          } ${
                            light
                              ? "text-white/70"
                              : "text-ink/58"
                          }`}
                        >
                          {
                            slide.body
                          }
                        </p>
                      ) : null}


                      {slide.ctaLabel ? (
                        <span
                          className={`mt-7 inline-flex items-center gap-3 rounded-full px-5 py-3 text-xs font-bold backdrop-blur-md md:px-6 md:py-3.5 md:text-sm ${
                            light
                              ? `
                                border
                                border-white/28
                                bg-white/10
                                text-white
                              `
                              : `
                                border
                                border-black/15
                                bg-white/62
                                text-ink
                              `
                          }`}
                        >
                          {
                            slide.ctaLabel
                          }

                          <span
                            aria-hidden="true"
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


          {/* ===============================================
              ULTRA-SUBTLE TOP GLASS
          =============================================== */}

          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[16%]"
            style={{
              background: `
                linear-gradient(
                  180deg,
                  rgba(
                    255,
                    255,
                    255,
                    .08
                  ),
                  transparent
                )
              `
            }}
          />
        </div>


        {/* =================================================
            SLIDE CONTROLS

            They only appear once the cinematic intro
            has completed.
        ================================================= */}

        {slides.length > 1 ? (
          <>
            <div
              className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 backdrop-blur-xl"
              style={{
                opacity:
                  controlsIn,

                transform: `
                  translateX(
                    -50%
                  )
                  translateY(
                    ${
                      (
                        1 -
                        controlsIn
                      ) *
                      12
                    }px
                  )
                `
              }}
            >
              {slides.map(
                (
                  slide,
                  index
                ) => (
                  <button
                    key={
                      `dot-${slide.id}`
                    }
                    type="button"
                    aria-label={
                      `Show slide ${
                        index + 1
                      }`
                    }
                    aria-current={
                      index ===
                      active
                        ? "true"
                        : undefined
                    }
                    onClick={() =>
                      setActive(
                        index
                      )
                    }
                    className="flex h-4 items-center justify-center"
                  >
                    <span
                      className={`block h-[3px] rounded-full transition-all duration-500 ${
                        index ===
                        active
                          ? `
                            w-8
                            bg-white
                          `
                          : `
                            w-[4px]
                            bg-white/50
                          `
                      }`}
                    />
                  </button>
                )
              )}
            </div>


            <div
              className="absolute bottom-5 right-6 z-40 hidden items-center gap-2 md:flex lg:right-9"
              style={{
                opacity:
                  controlsIn
              }}
            >
              <button
                type="button"
                onClick={
                  previous
                }
                aria-label="Previous campaign"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-black/18 text-white backdrop-blur-xl transition hover:bg-black/32"
              >
                <Arrow
                  side="left"
                />
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Next campaign"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-black/18 text-white backdrop-blur-xl transition hover:bg-black/32"
              >
                <Arrow
                  side="right"
                />
              </button>
            </div>
          </>
        ) : null}


        {/* =================================================
            INTRO SCROLL MARKER
        ================================================= */}

        <div
          className="pointer-events-none absolute bottom-5 left-1/2 z-40 -translate-x-1/2 text-center"
          style={{
            opacity:
              1 -
              smooth(
                range(
                  progress,
                  0.02,
                  0.20
                )
              )
          }}
        >
          <div className="text-[8px] font-black uppercase tracking-[0.25em] text-ink/28">
            Scroll to enter
          </div>

          <div className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-[#FF7A00]/70 to-transparent" />
        </div>


        {/* =================================================
            VERY THIN SCROLL PROGRESS
        ================================================= */}

        <div
          className="absolute inset-x-0 bottom-0 z-50 h-[2px] bg-black/[0.035]"
          style={{
            opacity:
              1 -
              controlsIn *
              0.5
          }}
        >
          <div
            className="h-full bg-[#FF7A00]"
            style={{
              width:
                `${
                  Math.min(
                    progress / 0.55,
                    1
                  ) *
                  100
                }%`
            }}
          />
        </div>


        <span
          className="sr-only"
          aria-live="polite"
        >
          Campaign{" "}
          {active + 1} of{" "}
          {slides.length}:{" "}
          {current?.title}
        </span>
      </div>
    </section>
  );
}

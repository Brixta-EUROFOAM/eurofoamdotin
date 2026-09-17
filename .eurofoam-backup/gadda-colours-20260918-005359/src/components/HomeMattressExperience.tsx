"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import type {
  Mattress
} from "@/lib/catalog";


type StoryLayer =
  Mattress["layers"][number] & {
    visualAsset?: string;
    material?: string;
    thickness?: string;
    density?: string;
    technicalNote?: string;
    visualKind?: string;
  };


function clamp(
  value: number,
  min = 0,
  max = 1
) {
  return Math.min(
    max,
    Math.max(min, value)
  );
}


function range(
  value: number,
  start: number,
  end: number
) {
  if (start === end) return 0;

  return clamp(
    (value - start) /
    (end - start)
  );
}


function ease(value: number) {
  const t = clamp(value);

  return (
    t *
    t *
    (3 - 2 * t)
  );
}


function cinematicEase(value: number) {
  const t = clamp(value);

  return (
    t *
    t *
    t *
    (
      t *
      (t * 6 - 15)
      + 10
    )
  );
}


function getKind(
  layer: StoryLayer
) {
  if (
    layer.visualKind &&
    layer.visualKind !== "auto"
  ) {
    return layer.visualKind;
  }

  const text =
    `${layer.name} ${layer.description}`
      .toLowerCase();

  if (
    text.includes("cover") ||
    text.includes("fabric") ||
    text.includes("knit")
  ) {
    return "fabric";
  }

  if (
    text.includes("grid") ||
    text.includes("zone")
  ) {
    return "zoned";
  }

  if (
    text.includes("core") ||
    text.includes("base")
  ) {
    return "core";
  }

  if (
    text.includes("spring") ||
    text.includes("coil")
  ) {
    return "spring";
  }

  return "foam";
}


function fallbackBackground(
  kind: string
) {
  if (kind === "fabric") {
    return (
      "linear-gradient(135deg," +
      "#fffefa,#eee5dc)"
    );
  }

  if (kind === "zoned") {
    return (
      "linear-gradient(135deg," +
      "#ff9d4c,#ff6f00)"
    );
  }

  if (kind === "core") {
    return (
      "linear-gradient(135deg," +
      "#393735,#111)"
    );
  }

  if (kind === "spring") {
    return (
      "linear-gradient(135deg," +
      "#e9e5df,#aaa)"
    );
  }

  return (
    "linear-gradient(135deg," +
    "#ffe5cf,#e6b384)"
  );
}


function Spec({
  label,
  value
}: {
  label: string;
  value?: string;
}) {
  if (!value?.trim()) {
    return null;
  }

  return (
    <div className="border-t border-ink/10 pt-3">
      <div className="text-[9px] font-black uppercase tracking-[0.17em] text-ink/35">
        {label}
      </div>

      <div className="mt-1 text-sm font-bold leading-5 text-ink">
        {value}
      </div>
    </div>
  );
}


export default function HomeMattressExperience({
  mattress
}: {
  mattress: Mattress;
}) {
  const rootRef =
    useRef<HTMLElement | null>(null);

  const frameRef =
    useRef<number | null>(null);

  const [progress, setProgress] =
    useState(0);

  const [mobile, setMobile] =
    useState(false);

  const [reducedMotion, setReducedMotion] =
    useState(false);

  const [failedAssets, setFailedAssets] =
    useState<Record<number, boolean>>({});


  const layers =
    mattress.layers as StoryLayer[];


  useEffect(() => {
    function resize() {
      setMobile(
        window.innerWidth < 768
      );
    }

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    return () =>
      window.removeEventListener(
        "resize",
        resize
      );
  }, []);


  useEffect(() => {
    const query =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    function sync() {
      setReducedMotion(
        query.matches
      );
    }

    sync();

    query.addEventListener?.(
      "change",
      sync
    );

    return () =>
      query.removeEventListener?.(
        "change",
        sync
      );
  }, []);


  useEffect(() => {
    if (reducedMotion) {
      setProgress(0.76);
      return;
    }

    function calculate() {
      frameRef.current = null;

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

      setProgress(
        travel > 0
          ? clamp(
              passed / travel
            )
          : 0
      );
    }

    function request() {
      if (
        frameRef.current !== null
      ) {
        return;
      }

      frameRef.current =
        requestAnimationFrame(
          calculate
        );
    }

    calculate();

    window.addEventListener(
      "scroll",
      request,
      { passive: true }
    );

    window.addEventListener(
      "resize",
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

      if (
        frameRef.current !== null
      ) {
        cancelAnimationFrame(
          frameRef.current
        );
      }
    };
  }, [reducedMotion]);


  const height = useMemo(
    () => {
      if (reducedMotion) {
        return "160vh";
      }

      /*
       * Deliberately long.
       * Scroll is the animation timeline.
       */
      return mobile
        ? `${480 + layers.length * 75}vh`
        : `${560 + layers.length * 88}vh`;
    },
    [
      layers.length,
      mobile,
      reducedMotion
    ]
  );


  if (!layers.length) {
    return null;
  }


  /*
   * ======================================================
   * TIMELINE
   *
   * 00 - 10   complete mattress / introduction
   * 08 - 22   camera approaches
   * 15 - 31   stack separates
   * 28 - 74   travel through individual layers
   * 72 - 84   full engineering exploded overview
   * 82 - 94   reassembly
   * 92 -100   completed mattress / CTA
   * ======================================================
   */


  const introExit =
    cinematicEase(
      range(
        progress,
        0.075,
        0.18
      )
    );


  const approach =
    cinematicEase(
      range(
        progress,
        0.07,
        0.23
      )
    );


  const explosion =
    cinematicEase(
      range(
        progress,
        0.16,
        0.31
      )
    );


  const inspection =
    range(
      progress,
      0.285,
      0.735
    );


  const overview =
    cinematicEase(
      range(
        progress,
        0.72,
        0.835
      )
    );


  const collapse =
    cinematicEase(
      range(
        progress,
        0.82,
        0.94
      )
    );


  const finalReveal =
    cinematicEase(
      range(
        progress,
        0.925,
        0.992
      )
    );


  const layerPosition =
    inspection *
    layers.length;


  const activeIndex =
    Math.min(
      layers.length - 1,
      Math.max(
        0,
        Math.floor(
          layerPosition
        )
      )
    );


  const activeLayer =
    layers[activeIndex];


  const activeKind =
    getKind(activeLayer);


  const localProgress =
    inspection >= 1
      ? 1
      : (
          layerPosition -
          Math.floor(
            layerPosition
          )
        );


  /*
   * Each layer gets its own mini camera movement:
   *
   * enter
   * approach
   * extreme close-up
   * hold
   * withdraw
   */
  const focusEnter =
    cinematicEase(
      range(
        localProgress,
        0.03,
        0.23
      )
    );


  const deepDiveIn =
    cinematicEase(
      range(
        localProgress,
        0.19,
        0.47
      )
    );


  const deepDiveOut =
    1 -
    cinematicEase(
      range(
        localProgress,
        0.68,
        0.94
      )
    );


  const deepDive =
    deepDiveIn *
    deepDiveOut;


  const inspectionVisible =
    ease(
      range(
        progress,
        0.27,
        0.35
      )
    ) *
    (
      1 -
      ease(
        range(
          progress,
          0.73,
          0.80
        )
      )
    );


  const actualExplosion =
    explosion *
    (
      1 - collapse
    );


  const center =
    (
      layers.length - 1
    ) / 2;


  const explodedGap =
    mobile
      ? 105
      : 145;


  const assembledGap =
    mobile
      ? 13
      : 18;


  const currentGap =
    assembledGap +
    (
      explodedGap -
      assembledGap
    ) *
    actualExplosion;


  const activeRelative =
    activeIndex -
    center;


  /*
   * The whole object moves against the active layer.
   * This gives the illusion that the camera itself
   * is travelling vertically through the mattress.
   */
  const cameraY =
    -activeRelative *
    currentGap *
    inspectionVisible *
    0.78;


  const cameraScale =
    (
      0.86 +
      approach * 0.13 +
      deepDive * (
        mobile
          ? 0.24
          : 0.39
      )
      -
      overview * 0.08
    );


  const hasTechnicalData =
    Boolean(
      activeLayer.material ||
      activeLayer.thickness ||
      activeLayer.density ||
      activeLayer.technicalNote
    );


  const activeAsset =
    activeLayer.visualAsset ||
    `/layers/${mattress.slug}/layer-${activeIndex + 1}.png`;


  return (
    <section
      ref={rootRef}
      style={{
        height
      }}
      className="relative bg-white"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">

        {/* =================================================
            BASE PAGE COLOUR

            White at entry.
            Warm neutral through the inspection.
            Soft orange at exit so it dissolves into the
            following Eurofoam orange-light homepage area.
        ================================================= */}

        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                180deg,
                #ffffff 0%,
                #faf8f4 40%,
                #f7f3ed 76%,
                #fff3e9 100%
              )
            `
          }}
        />


        {/* warm source behind mattress */}

        <div
          className="absolute left-1/2 top-[42%] h-[85vw] max-h-[920px] w-[85vw] max-w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: `
              radial-gradient(
                circle,
                rgba(255,122,0,${
                  0.055 +
                  actualExplosion *
                  0.07
                }) 0%,
                rgba(255,122,0,.025) 38%,
                transparent 70%
              )
            `
          }}
        />


        {/* =================================================
            MATERIAL MACRO / "CAMERA INSIDE"
        ================================================= */}

        <div
          className="pointer-events-none absolute inset-0 z-[3] overflow-hidden"
          style={{
            opacity:
              deepDive *
              inspectionVisible *
              0.24
          }}
        >
          {!failedAssets[
            activeIndex
          ] ? (
            <img
              key={`macro-${activeIndex}`}
              src={activeAsset}
              alt=""
              onError={() =>
                setFailedAssets(
                  (current) => ({
                    ...current,
                    [activeIndex]: true
                  })
                )
              }
              className="absolute left-1/2 top-1/2 w-[260vw] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
              style={{
                transform: `
                  translate(
                    -50%,
                    -50%
                  )
                  scale(
                    ${
                      1 +
                      deepDive *
                      1.15
                    }
                  )
                `,
                filter: `
                  blur(
                    ${
                      1.5 +
                      deepDive *
                      3
                    }px
                  )
                  saturate(.92)
                `
              }}
            />
          ) : null}

          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(
                  circle at 50% 50%,
                  rgba(255,255,255,.02),
                  rgba(247,243,237,.68) 70%
                )
              `
            }}
          />
        </div>


        {/* =================================================
            CINEMATIC CHAPTER UI
        ================================================= */}

        <div
          className="absolute left-6 right-6 top-6 z-[60] flex items-center justify-between md:left-10 md:right-10"
          style={{
            opacity:
              1 -
              finalReveal
          }}
        >
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-ink/35">
            EUROFOAM /
            MATTRESS CONSTRUCTION
          </div>

          <div className="text-[9px] font-black tracking-[0.16em] text-ink/30">
            {String(
              activeIndex + 1
            ).padStart(
              2,
              "0"
            )}
            {" / "}
            {String(
              layers.length
            ).padStart(
              2,
              "0"
            )}
          </div>
        </div>


        {/* =================================================
            INTRODUCTION
        ================================================= */}

        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-5"
          style={{
            opacity:
              1 -
              range(
                progress,
                0.09,
                0.18
              ),

            transform: `
              translateY(
                ${
                  -introExit *
                  42
                }px
              )
            `
          }}
        >
          <div className="mb-[37vh] text-center md:mb-[38vh]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D95F0E]">
              Inside {
                mattress.name
              }
            </p>

            <h2 className="mt-4 font-display text-[clamp(3.2rem,7vw,7.8rem)] leading-[0.84] tracking-[-0.06em]">
              Look deeper.
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-ink/46 md:text-base">
              Scroll through the
              mattress from surface
              to support.
            </p>
          </div>
        </div>


        {/* =================================================
            REAL IMAGE STACK

            These are the transparent PNGs.
            NO CSS rectangles sit behind successful assets.
        ================================================= */}

        <div
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{
            opacity:
              1 -
              finalReveal
          }}
        >
          <div
            className="relative h-[59vh] w-full max-w-[1500px]"
            style={{
              transform: `
                translateY(
                  ${
                    cameraY +
                    (
                      introExit <
                      1
                        ? 60
                        : 0
                    )
                  }px
                )
                scale(
                  ${cameraScale}
                )
              `,

              transformOrigin:
                "50% 50%"
            }}
          >
            {layers.map(
              (
                originalLayer,
                index
              ) => {
                const layer =
                  originalLayer as
                  StoryLayer;

                const relative =
                  index - center;

                const asset =
                  layer.visualAsset ||
                  `/layers/${mattress.slug}/layer-${index + 1}.png`;

                const distance =
                  Math.abs(
                    index -
                    activeIndex
                  );

                const focus =
                  clamp(
                    1 -
                    distance
                  );

                const active =
                  index ===
                  activeIndex;

                const y =
                  relative *
                  currentGap;

                const attention =
                  inspectionVisible *
                  focusEnter;

                const activeScale =
                  1 +
                  (
                    active
                      ? attention *
                        (
                          0.075 +
                          deepDive *
                          0.075
                        )
                      : 0
                  );

                const faded =
                  inspectionVisible *
                  (
                    1 -
                    focus
                  );

                const opacity =
                  1 -
                  faded * 0.72;

                const blur =
                  faded *
                  (
                    deepDive
                      ? 2.4
                      : 0.6
                  );

                /*
                 * tiny horizontal parallax,
                 * giving each layer physical depth.
                 */
                const x =
                  relative *
                  actualExplosion *
                  (
                    mobile
                      ? 2
                      : 5
                  );

                const tilt =
                  (
                    -0.5 +
                    relative *
                    0.11
                  ) *
                  actualExplosion;

                return (
                  <div
                    key={
                      `${layer.name}-${index}`
                    }
                    className="absolute left-1/2 top-1/2 w-[94vw] max-w-[1220px]"
                    style={{
                      zIndex:
                        layers.length -
                        index,

                      opacity,

                      transform: `
                        translate(
                          -50%,
                          -50%
                        )
                        translate3d(
                          ${x}px,
                          ${y}px,
                          0
                        )
                        rotate(
                          ${tilt}deg
                        )
                        scale(
                          ${activeScale}
                        )
                      `,

                      filter: `
                        blur(
                          ${blur}px
                        )
                      `
                    }}
                  >
                    {!failedAssets[
                      index
                    ] ? (
                      <img
                        src={asset}
                        alt={
                          `${mattress.name} — ${layer.name}`
                        }
                        draggable={false}
                        onError={() =>
                          setFailedAssets(
                            (current) => ({
                              ...current,
                              [index]:
                                true
                            })
                          )
                        }
                        className="block h-auto w-full select-none object-contain"
                        style={{
                          /*
                           * drop-shadow follows the PNG alpha,
                           * unlike a rectangular box-shadow.
                           */
                          filter: active
                            ? `
                              drop-shadow(
                                0
                                ${
                                  24 +
                                  deepDive *
                                  16
                                }px
                                ${
                                  30 +
                                  deepDive *
                                  25
                                }px
                                rgba(
                                  65,
                                  42,
                                  23,
                                  .19
                                )
                              )
                            `
                            : `
                              drop-shadow(
                                0
                                17px
                                19px
                                rgba(
                                  45,
                                  31,
                                  20,
                                  .09
                                )
                              )
                            `
                        }}
                      />
                    ) : (
                      <div
                        className="mx-auto h-[72px] w-[88%] rounded-[28px]"
                        style={{
                          background:
                            fallbackBackground(
                              getKind(
                                layer
                              )
                            )
                        }}
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>


        {/* =================================================
            ACTIVE LAYER COPY
        ================================================= */}

        <div
          className="absolute bottom-[5.5vh] left-6 right-6 z-50 md:bottom-[7vh] md:left-10 md:right-10"
          style={{
            opacity:
              inspectionVisible *
              (
                1 -
                overview
              )
          }}
        >
          <div className="mx-auto flex max-w-[1380px] items-end justify-between gap-12">
            <div
              key={
                activeIndex
              }
              className="max-w-[620px]"
              style={{
                opacity:
                  0.52 +
                  focusEnter *
                  0.48,

                transform: `
                  translateY(
                    ${
                      (
                        1 -
                        focusEnter
                      ) *
                      18
                    }px
                  )
                `
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-black tracking-[0.19em] text-[#D95F0E]">
                  {String(
                    activeIndex +
                    1
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>

                <span className="h-px w-12 bg-[#FF7A00]/55" />

                <span className="text-[10px] font-black uppercase tracking-[0.17em] text-ink/35">
                  {
                    activeKind
                  }
                </span>
              </div>

              <h3 className="mt-3 font-display text-[clamp(2.7rem,5.4vw,5.9rem)] leading-[0.87] tracking-[-0.055em]">
                {
                  activeLayer.name
                }
              </h3>

              <p className="mt-5 max-w-lg text-sm leading-6 text-ink/52 md:text-base md:leading-7">
                {
                  activeLayer.description
                }
              </p>
            </div>


            {hasTechnicalData ? (
              <div
                className="hidden w-[320px] rounded-[1.6rem] border border-ink/8 bg-white/66 p-5 shadow-[0_24px_70px_rgba(35,25,17,.07)] backdrop-blur-xl md:block"
                style={{
                  opacity:
                    deepDive,

                  transform: `
                    translateY(
                      ${
                        (
                          1 -
                          deepDive
                        ) *
                        20
                      }px
                    )
                  `
                }}
              >
                <div className="text-[9px] font-black uppercase tracking-[0.19em] text-[#D95F0E]">
                  Construction
                </div>

                <div className="mt-4 space-y-4">
                  <Spec
                    label="Material"
                    value={
                      activeLayer.material
                    }
                  />

                  <Spec
                    label="Thickness"
                    value={
                      activeLayer.thickness
                    }
                  />

                  <Spec
                    label="Density / specification"
                    value={
                      activeLayer.density
                    }
                  />

                  <Spec
                    label="Engineering detail"
                    value={
                      activeLayer.technicalNote
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>


        {/* =================================================
            EXPLODED OVERVIEW
        ================================================= */}

        <div
          className="pointer-events-none absolute inset-0 z-45"
          style={{
            opacity:
              overview *
              (
                1 -
                collapse
              )
          }}
        >
          <div className="absolute left-[6vw] top-[15vh] max-w-[480px]">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D95F0E]">
              The complete system
            </p>

            <h3 className="mt-4 font-display text-[clamp(3rem,5.4vw,6rem)] leading-[0.88] tracking-[-0.055em]">
              {
                layers.length
              } layers.
              <br />
              Working
              <br />
              together.
            </h3>
          </div>


          <div className="absolute right-[5vw] top-[18vh] hidden space-y-3 lg:block">
            {layers.map(
              (
                layer,
                index
              ) => (
                <div
                  key={
                    `${layer.name}-overview`
                  }
                  className="flex items-center gap-3"
                >
                  <span className="w-6 text-right text-[9px] font-black text-[#D95F0E]">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <span className="h-px w-10 bg-ink/15" />

                  <span className="max-w-[220px] text-xs font-bold text-ink/65">
                    {
                      layer.name
                    }
                  </span>
                </div>
              )
            )}
          </div>
        </div>


        {/* =================================================
            FINAL — REASSEMBLED
        ================================================= */}

        <div
          className="absolute inset-0 z-[55] flex items-center justify-center px-5"
          style={{
            opacity:
              finalReveal
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(
                  180deg,
                  rgba(
                    255,
                    255,
                    255,
                    .34
                  ),
                  rgba(
                    255,
                    227,
                    204,
                    .72
                  )
                )
              `
            }}
          />

          <div
            className="relative z-10 mb-[34vh] text-center md:mb-[37vh]"
            style={{
              transform: `
                translateY(
                  ${
                    (
                      1 -
                      finalReveal
                    ) *
                    24
                  }px
                )
              `
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D95F0E]">
              {
                mattress.name
              }
            </p>

            <h2 className="mt-4 font-display text-[clamp(3.3rem,7.5vw,7.8rem)] leading-[0.84] tracking-[-0.06em]">
              Built from
              <br />
              the inside out.
            </h2>

            <Link
              href={
                `/mattresses/${mattress.slug}`
              }
              className="mt-7 inline-flex rounded-full bg-ink px-7 py-4 text-sm font-black text-white transition hover:bg-[#D95F0E]"
            >
              EXPLORE {
                mattress.name.toUpperCase()
              } →
            </Link>
          </div>
        </div>


        {/* =================================================
            TOP/BOTTOM SEAM MASKS

            Prevents the section from looking like a
            separate embedded animation module.
        ================================================= */}

        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[70] h-20"
          style={{
            background: `
              linear-gradient(
                to bottom,
                white,
                transparent
              )
            `
          }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[70] h-24"
          style={{
            opacity:
              range(
                progress,
                0.87,
                1
              ),

            background: `
              linear-gradient(
                to bottom,
                transparent,
                #FFE3CC
              )
            `
          }}
        />


        {/* =================================================
            SCROLL PROGRESS
        ================================================= */}

        <div className="absolute bottom-0 left-0 right-0 z-[80] h-[2px] bg-black/[0.035]">
          <div
            className="h-full bg-[#FF7A00]"
            style={{
              width:
                `${
                  progress *
                  100
                }%`
            }}
          />
        </div>


        <div
          className="absolute bottom-6 left-1/2 z-[80] -translate-x-1/2 text-center"
          style={{
            opacity:
              1 -
              range(
                progress,
                0.015,
                0.09
              )
          }}
        >
          <div className="text-[8px] font-black uppercase tracking-[0.22em] text-ink/30">
            Scroll to enter
          </div>

          <div className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-[#FF7A00] to-transparent" />
        </div>
      </div>
    </section>
  );
}

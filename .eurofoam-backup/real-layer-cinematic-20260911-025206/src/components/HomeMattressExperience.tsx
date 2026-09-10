"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from "react";

import type {
  Mattress,
  MattressLayer,
  MattressLayerVisual
} from "@/lib/catalog";


function clamp(value: number, min = 0, max = 1) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function mapRange(
  value: number,
  start: number,
  end: number
) {
  if (end === start) return 0;

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
      (t * 6 - 15) +
      10
    )
  );
}

function inferKind(
  layer: MattressLayer
): MattressLayerVisual {
  if (
    layer.visualKind &&
    layer.visualKind !== "auto"
  ) {
    return layer.visualKind;
  }

  const value =
    `${layer.name} ${layer.description}`
      .toLowerCase();

  if (
    value.includes("spring") ||
    value.includes("coil")
  ) {
    return "spring";
  }

  if (
    value.includes("cover") ||
    value.includes("knit") ||
    value.includes("fabric") ||
    value.includes("weave")
  ) {
    return "fabric";
  }

  if (value.includes("latex")) {
    return "latex";
  }

  if (
    value.includes("grid") ||
    value.includes("zone")
  ) {
    return "zoned";
  }

  if (
    value.includes("base") ||
    value.includes("core") ||
    value.includes("stability")
  ) {
    return "core";
  }

  return "foam";
}


type MaterialLook = {
  face: string;
  side: string;
  border: string;
  texture: CSSProperties;
  atmosphere: string;
};


function materialLook(
  kind: MattressLayerVisual,
  index: number
): MaterialLook {
  if (kind === "fabric") {
    return {
      face:
        "linear-gradient(135deg,#fffdf9 0%,#fff3e8 45%,#eaded2 100%)",

      side: "#d9cabb",

      border: "rgba(130,105,82,.28)",

      atmosphere:
        "rgba(255,122,0,.17)",

      texture: {
        backgroundImage: `
          repeating-linear-gradient(
            45deg,
            rgba(63,48,35,.10) 0px,
            rgba(63,48,35,.10) 1px,
            transparent 1px,
            transparent 7px
          ),
          repeating-linear-gradient(
            -45deg,
            rgba(63,48,35,.07) 0px,
            rgba(63,48,35,.07) 1px,
            transparent 1px,
            transparent 7px
          )
        `,
        backgroundSize: "14px 14px"
      }
    };
  }

  if (kind === "zoned") {
    return {
      face:
        "linear-gradient(135deg,#ffbd82 0%,#ff8b2e 55%,#e8650e 100%)",

      side: "#c85008",

      border: "rgba(140,55,0,.30)",

      atmosphere:
        "rgba(255,106,0,.28)",

      texture: {
        backgroundImage: `
          repeating-linear-gradient(
            90deg,
            rgba(255,255,255,.22) 0px,
            rgba(255,255,255,.22) 3px,
            transparent 3px,
            transparent 38px
          ),
          repeating-linear-gradient(
            0deg,
            rgba(50,20,0,.10) 0px,
            rgba(50,20,0,.10) 2px,
            transparent 2px,
            transparent 24px
          )
        `,
        backgroundSize: "auto"
      }
    };
  }

  if (kind === "core") {
    return {
      face:
        "linear-gradient(135deg,#4b4845 0%,#242321 52%,#111 100%)",

      side: "#090909",

      border: "rgba(255,255,255,.10)",

      atmosphere:
        "rgba(30,28,26,.42)",

      texture: {
        backgroundImage: `
          radial-gradient(
            circle at 3px 3px,
            rgba(255,255,255,.11) 1.1px,
            transparent 1.3px
          )
        `,
        backgroundSize: "12px 12px"
      }
    };
  }

  if (kind === "spring") {
    return {
      face:
        "linear-gradient(135deg,#ece7df 0%,#c9c2ba 100%)",

      side: "#aaa39c",

      border: "rgba(50,50,50,.20)",

      atmosphere:
        "rgba(180,185,190,.28)",

      texture: {
        backgroundImage: `
          radial-gradient(
            circle,
            transparent 0px,
            transparent 7px,
            rgba(25,25,25,.35) 8px,
            rgba(25,25,25,.35) 9px,
            transparent 10px
          )
        `,
        backgroundSize: "32px 32px"
      }
    };
  }

  if (kind === "latex") {
    return {
      face:
        "linear-gradient(135deg,#f4e5b7 0%,#e2c66f 100%)",

      side: "#c4a64f",

      border: "rgba(75,55,0,.20)",

      atmosphere:
        "rgba(235,200,90,.22)",

      texture: {
        backgroundImage: `
          radial-gradient(
            circle,
            rgba(60,45,0,.20) 0px,
            rgba(60,45,0,.20) 2px,
            transparent 2.5px
          )
        `,
        backgroundSize: "18px 18px"
      }
    };
  }

  const foamColors = [
    ["#fff1e4", "#ffd1ab", "#d89e73"],
    ["#f5dfce", "#e6b68e", "#bd835c"],
    ["#f3c9a4", "#e79a60", "#bf6631"]
  ];

  const colors =
    foamColors[index % foamColors.length];

  return {
    face: `linear-gradient(135deg,${colors[0]} 0%,${colors[1]} 100%)`,

    side: colors[2],

    border: "rgba(100,55,25,.18)",

    atmosphere:
      "rgba(255,145,70,.20)",

    texture: {
      backgroundImage: `
        radial-gradient(
          circle,
          rgba(110,60,25,.14) 0px,
          rgba(110,60,25,.14) 1.5px,
          transparent 1.7px
        )
      `,
      backgroundSize: "11px 11px"
    }
  };
}


function Metric({
  label,
  value
}: {
  label: string;
  value?: string;
}) {
  if (!value?.trim()) return null;

  return (
    <div className="border-t border-current/10 pt-3">
      <div className="text-[9px] font-black uppercase tracking-[0.17em] opacity-40">
        {label}
      </div>

      <div className="mt-1 text-sm font-bold leading-5">
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

  const raf =
    useRef<number | null>(null);

  const [progress, setProgress] =
    useState(0);

  const [mobile, setMobile] =
    useState(false);

  const [reducedMotion, setReducedMotion] =
    useState(false);

  const layers =
    mattress.layers || [];

  useEffect(() => {
    const size = () => {
      setMobile(
        window.innerWidth < 768
      );
    };

    size();

    window.addEventListener(
      "resize",
      size
    );

    return () =>
      window.removeEventListener(
        "resize",
        size
      );
  }, []);

  useEffect(() => {
    const query =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    const sync = () =>
      setReducedMotion(
        query.matches
      );

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
      setProgress(0.72);
      return;
    }

    function update() {
      raf.current = null;

      const root =
        rootRef.current;

      if (!root) return;

      const rect =
        root.getBoundingClientRect();

      const distance =
        root.offsetHeight -
        window.innerHeight;

      const passed =
        -rect.top;

      const next =
        distance <= 0
          ? 0
          : clamp(
              passed / distance
            );

      setProgress(next);
    }

    function request() {
      if (raf.current !== null)
        return;

      raf.current =
        requestAnimationFrame(
          update
        );
    }

    update();

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

      if (raf.current !== null) {
        cancelAnimationFrame(
          raf.current
        );
      }
    };
  }, [reducedMotion]);


  const height = useMemo(() => {
    if (reducedMotion)
      return "160vh";

    const base =
      mobile ? 470 : 540;

    const perLayer =
      mobile ? 55 : 65;

    return `${
      base +
      layers.length * perLayer
    }vh`;
  }, [
    layers.length,
    mobile,
    reducedMotion
  ]);


  if (!layers.length) {
    return null;
  }


  /*
   * SCROLL TIMELINE
   *
   * 00 - 10%  introduction
   * 08 - 18%  photo pushes toward viewer
   * 15 - 27%  stylized mattress appears
   * 22 - 35%  construction separates
   * 32 - 78%  camera visits each layer
   * 77 - 91%  full exploded engineering view
   * 88 - 96%  mattress reassembles
   * 94 -100%  final product statement
   */

  const introOut =
    smoother(
      mapRange(
        progress,
        0.07,
        0.16
      )
    );

  const imageZoom =
    smoother(
      mapRange(
        progress,
        0.06,
        0.20
      )
    );

  const modelIn =
    smoother(
      mapRange(
        progress,
        0.15,
        0.27
      )
    );

  const explode =
    smoother(
      mapRange(
        progress,
        0.22,
        0.35
      )
    );

  const inspect =
    mapRange(
      progress,
      0.32,
      0.78
    );

  const overview =
    smoother(
      mapRange(
        progress,
        0.77,
        0.86
      )
    );

  const reassemble =
    smoother(
      mapRange(
        progress,
        0.88,
        0.96
      )
    );

  const finalIn =
    smoother(
      mapRange(
        progress,
        0.94,
        0.99
      )
    );


  const inspectCount =
    Math.max(
      layers.length,
      1
    );

  const inspectPosition =
    inspect *
    inspectCount;

  const activeIndex =
    Math.min(
      layers.length - 1,
      Math.floor(
        inspectPosition
      )
    );

  const activeLayer =
    layers[activeIndex];

  const activeKind =
    inferKind(activeLayer);

  const activeLook =
    materialLook(
      activeKind,
      activeIndex
    );

  const local =
    inspect >= 1
      ? 1
      : inspectPosition -
        Math.floor(
          inspectPosition
        );

  const diveIn =
    smoother(
      mapRange(
        local,
        0.06,
        0.34
      )
    );

  const diveOut =
    1 -
    smoother(
      mapRange(
        local,
        0.73,
        0.97
      )
    );

  const dive =
    diveIn * diveOut;

  const inspectionVisible =
    mapRange(
      progress,
      0.30,
      0.37
    ) *
    (
      1 -
      mapRange(
        progress,
        0.78,
        0.84
      )
    );

  const deepTextureOpacity =
    dive *
    inspectionVisible *
    0.48;

  const stackCenter =
    (layers.length - 1) / 2;

  const spacing =
    mobile ? 72 : 94;

  const activeRelative =
    activeIndex -
    stackCenter;

  const cameraScale =
    0.88 +
    modelIn * 0.06 +
    dive * (
      mobile
        ? 0.38
        : 0.62
    ) -
    overview * 0.08;

  const cameraY =
    dive *
    activeRelative *
    spacing *
    -0.75;

  const introOpacity =
    1 -
    mapRange(
      progress,
      0.08,
      0.16
    );

  const photoOpacity =
    1 -
    mapRange(
      progress,
      0.14,
      0.25
    );


  return (
    <section
      ref={rootRef}
      style={{ height }}
      className="relative bg-white"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#F5F4F2]">

        {/* -------------------------------------------------
            ACTIVE MATERIAL ATMOSPHERE
        ------------------------------------------------- */}

        <div
          className="absolute inset-0"
          style={{
            opacity:
              deepTextureOpacity,

            background:
              activeLook.face
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            ...activeLook.texture,

            opacity:
              deepTextureOpacity *
              0.75,

            transform: `
              scale(${
                1 +
                dive * 2.2
              })
            `
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                circle at 50% 48%,
                ${activeLook.atmosphere},
                transparent 43%
              )
            `,

            opacity:
              0.35 +
              explode * 0.65
          }}
        />


        {/* -------------------------------------------------
            VERY TOP CHAPTER INDICATOR
        ------------------------------------------------- */}

        <div
          className="absolute left-5 right-5 top-5 z-50 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.18em] text-ink/35 md:left-8 md:right-8"
          style={{
            opacity:
              finalIn
                ? 1 - finalIn
                : 1
          }}
        >
          <span>
            EUROFOAM /
            CONSTRUCTION
          </span>

          <span>
            {String(
              Math.min(
                activeIndex + 1,
                layers.length
              )
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
          </span>
        </div>


        {/* -------------------------------------------------
            INTRO
        ------------------------------------------------- */}

        <div
          className="absolute inset-0 z-20 flex items-center justify-center px-5"
          style={{
            opacity:
              introOpacity,

            transform: `
              translateY(${
                introOut * -40
              }px)
            `
          }}
        >
          <div className="relative z-20 mx-auto max-w-5xl text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D95F0E] md:text-xs">
              Inside {
                mattress.name
              }
            </p>

            <h2 className="mt-5 font-display text-[clamp(3.4rem,8vw,8.5rem)] leading-[0.82] tracking-[-0.065em] text-ink">
              Go beneath
              <br />
              the surface.
            </h2>

            <p className="mx-auto mt-7 max-w-xl text-sm leading-6 text-ink/50 md:text-lg md:leading-7">
              Scroll through the
              construction, from the
              first touch to the
              support core.
            </p>
          </div>
        </div>


        {/* -------------------------------------------------
            REAL PRODUCT IMAGE — CAMERA APPROACH
        ------------------------------------------------- */}

        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{
            opacity:
              photoOpacity
          }}
        >
          <div
            className="relative w-[86vw] max-w-[1080px] overflow-hidden rounded-[3rem] border border-black/10 bg-white p-2 shadow-[0_50px_140px_rgba(20,20,20,.17)]"
            style={{
              transform: `
                translateY(${
                  12 -
                  imageZoom * 8
                }vh)
                scale(${
                  0.74 +
                  imageZoom *
                  0.48
                })
              `,

              filter: `
                saturate(${
                  1 -
                  imageZoom *
                  0.15
                })
                blur(${
                  imageZoom *
                  1.5
                }px)
              `
            }}
          >
            <img
              src={mattress.image}
              alt={mattress.name}
              className="aspect-[16/10] w-full rounded-[2.5rem] object-cover"
            />

            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(
                    180deg,
                    transparent 40%,
                    rgba(0,0,0,.20)
                  )
                `
              }}
            />
          </div>
        </div>


        {/* -------------------------------------------------
            CONSTRUCTION MODEL CAMERA
        ------------------------------------------------- */}

        <div
          className="absolute inset-0 z-30 flex items-center justify-center"
          style={{
            opacity:
              modelIn *
              (
                1 -
                finalIn
              )
          }}
        >
          <div
            className="relative h-[52vh] w-full max-w-[1100px]"
            style={{
              perspective:
                "1600px",

              transform: `
                translateY(
                  ${cameraY}px
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
              (layer, index) => {
                const relative =
                  index -
                  stackCenter;

                const kind =
                  inferKind(layer);

                const look =
                  materialLook(
                    kind,
                    index
                  );

                const continuousFocus =
                  inspect *
                  Math.max(
                    layers.length -
                    1,
                    1
                  );

                const distance =
                  Math.abs(
                    index -
                    continuousFocus
                  );

                const focus =
                  clamp(
                    1 - distance
                  );

                const spreadAmount =
                  explode *
                  (
                    1 -
                    reassemble
                  );

                const y =
                  relative *
                  spacing *
                  spreadAmount;

                const depth =
                  focus *
                  dive *
                  160;

                const fadeOthers =
                  inspectionVisible *
                  dive;

                const opacity =
                  1 -
                  fadeOthers *
                  (
                    1 - focus
                  ) *
                  0.70;

                const scale =
                  1 +
                  focus *
                  dive *
                  0.07;

                const layerHeight =
                  mobile
                    ? 54
                    : 72;

                return (
                  <div
                    key={`${layer.name}-${index}`}
                    className="absolute left-1/2 top-1/2 w-[82vw] max-w-[820px] rounded-[1.7rem] border shadow-[0_28px_65px_rgba(24,24,24,.14)]"
                    style={{
                      height:
                        `${layerHeight}px`,

                      background:
                        look.face,

                      borderColor:
                        focus > 0.7 &&
                        dive > 0.2
                          ? "#FF7A00"
                          : look.border,

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
                          0,
                          ${y}px,
                          ${depth}px
                        )
                        rotateX(
                          ${
                            61 -
                            overview *
                            9
                          }deg
                        )
                        rotateZ(
                          ${
                            -3 +
                            overview *
                            3
                          }deg
                        )
                        scale(
                          ${scale}
                        )
                      `,

                      transformOrigin:
                        "center center"
                    }}
                  >

                    {/* MATERIAL TEXTURE */}

                    <div
                      className="absolute inset-0 overflow-hidden rounded-[1.65rem]"
                      style={{
                        ...look.texture,
                        opacity: 0.34
                      }}
                    />


                    {/* FRONT EDGE */}

                    <div
                      className="absolute bottom-[-11px] left-[3%] right-[3%] h-[13px] rounded-b-[1rem]"
                      style={{
                        background:
                          look.side,

                        filter:
                          "brightness(.88)"
                      }}
                    />


                    {/* ACTIVE ORANGE HAIRLINE */}

                    <div
                      className="absolute inset-x-5 top-3 h-px bg-white/25"
                    />

                  </div>
                );
              }
            )}
          </div>
        </div>


        {/* -------------------------------------------------
            ACTIVE LAYER INFORMATION
        ------------------------------------------------- */}

        <div
          className="absolute bottom-[5vh] left-5 right-5 z-40 md:bottom-[6vh] md:left-8 md:right-8"
          style={{
            opacity:
              inspectionVisible *
              (
                1 -
                overview
              )
          }}
        >
          <div className="mx-auto flex max-w-7xl items-end justify-between gap-10">

            <div
              key={
                activeIndex
              }
              className="max-w-[560px]"
              style={{
                transform: `
                  translateY(
                    ${
                      (
                        1 -
                        diveIn
                      ) *
                      18
                    }px
                  )
                `,

                opacity:
                  0.45 +
                  diveIn *
                  0.55
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-xs font-black tracking-[0.20em] text-[#D95F0E]">
                  {String(
                    activeIndex +
                    1
                  ).padStart(
                    2,
                    "0"
                  )}
                </div>

                <div className="h-px w-12 bg-[#FF7A00]/45" />

                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-ink/35">
                  {
                    activeKind
                  }
                </div>
              </div>

              <h3 className="mt-3 font-display text-[clamp(2.5rem,5vw,5.2rem)] leading-[0.91] tracking-[-0.045em]">
                {
                  activeLayer.name
                }
              </h3>

              <p className="mt-4 max-w-lg text-sm leading-6 text-ink/55 md:text-base md:leading-7">
                {
                  activeLayer.description
                }
              </p>
            </div>


            {/* TECHNICAL CARD */}

            <div
              className="hidden w-[310px] rounded-[1.7rem] border border-black/10 bg-white/80 p-5 shadow-[0_25px_70px_rgba(24,24,24,.10)] backdrop-blur-xl md:block"
              style={{
                opacity:
                  dive,

                transform: `
                  translateY(
                    ${
                      (
                        1 -
                        dive
                      ) *
                      22
                    }px
                  )
                `
              }}
            >
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#D95F0E]">
                Engineering detail
              </div>

              <div className="mt-4 space-y-4">
                <Metric
                  label="Material"
                  value={
                    activeLayer.material
                  }
                />

                <Metric
                  label="Thickness"
                  value={
                    activeLayer.thickness
                  }
                />

                <Metric
                  label="Density / specification"
                  value={
                    activeLayer.density
                  }
                />

                <Metric
                  label="Design note"
                  value={
                    activeLayer.technicalNote
                  }
                />

                {!activeLayer.material &&
                !activeLayer.thickness &&
                !activeLayer.density &&
                !activeLayer.technicalNote ? (
                  <div className="border-t border-black/10 pt-4 text-xs leading-5 text-ink/45">
                    Add exact engineering
                    specifications for this
                    layer from the Eurofoam
                    Admin panel.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>


        {/* -------------------------------------------------
            EXPLODED OVERVIEW
        ------------------------------------------------- */}

        <div
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-5"
          style={{
            opacity:
              overview *
              (
                1 -
                reassemble
              )
          }}
        >
          <div className="absolute left-5 top-[16vh] max-w-[430px] md:left-[7vw]">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D95F0E]">
              The complete build
            </p>

            <h3 className="mt-4 font-display text-[clamp(2.8rem,5.5vw,5.7rem)] leading-[0.90] tracking-[-0.05em]">
              {
                layers.length
              } layers.
              <br />
              One system.
            </h3>

            <p className="mt-5 max-w-sm text-sm leading-6 text-ink/50">
              Each layer changes the
              feel of the mattress
              above it and the support
              delivered below it.
            </p>
          </div>


          <div className="absolute right-[5vw] top-[19vh] hidden space-y-3 lg:block">
            {layers.map(
              (layer, index) => (
                <div
                  key={layer.name}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 text-right text-[9px] font-black text-[#D95F0E]">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <div className="h-px w-10 bg-ink/15" />

                  <div className="max-w-[190px] text-xs font-bold">
                    {layer.name}
                  </div>
                </div>
              )
            )}
          </div>
        </div>


        {/* -------------------------------------------------
            FINAL REASSEMBLY MESSAGE
        ------------------------------------------------- */}

        <div
          className="absolute inset-0 z-50 flex items-center justify-center px-5 text-center"
          style={{
            opacity:
              finalIn,

            transform: `
              scale(
                ${
                  0.94 +
                  finalIn *
                  0.06
                }
              )
            `
          }}
        >
          <div className="max-w-5xl">
            <p className="text-[10px] font-black uppercase tracking-[0.23em] text-[#D95F0E]">
              {
                mattress.name
              }
            </p>

            <h2 className="mt-5 font-display text-[clamp(3.3rem,8vw,8rem)] leading-[0.84] tracking-[-0.06em]">
              Built from
              <br />
              the inside out.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-ink/50 md:text-base">
              {
                mattress.kicker
              }
            </p>

            <Link
              href={`/mattresses/${mattress.slug}`}
              className="mt-7 inline-flex rounded-full bg-ink px-7 py-4 text-sm font-black text-white transition hover:bg-[#D95F0E]"
            >
              EXPLORE {
                mattress.name.toUpperCase()
              } →
            </Link>
          </div>
        </div>


        {/* -------------------------------------------------
            SCROLL PROGRESS
        ------------------------------------------------- */}

        <div className="absolute bottom-0 left-0 right-0 z-[70] h-[3px] bg-black/5">
          <div
            className="h-full bg-[#FF7A00]"
            style={{
              width:
                `${
                  progress * 100
                }%`
            }}
          />
        </div>


        <div
          className="absolute bottom-6 left-1/2 z-[70] -translate-x-1/2 text-center"
          style={{
            opacity:
              1 -
              mapRange(
                progress,
                0.01,
                0.10
              )
          }}
        >
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-ink/35">
            Scroll to enter
          </div>

          <div className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-[#FF7A00] to-transparent" />
        </div>
      </div>
    </section>
  );
}

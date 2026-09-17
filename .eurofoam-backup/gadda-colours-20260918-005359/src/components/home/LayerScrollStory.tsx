"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import type {
  Mattress,
  SiteSettings
} from "@/lib/catalog";


function fallbackFor(
  index: number
) {
  const colors = [
    "#F2EEE7",
    "#D7C1A9",
    "#B9A58F",
    "#2B2B2B",
    "#D8D1C6"
  ];

  return colors[
    index %
      colors.length
  ];
}


export default function LayerScrollStory({
  site,
  product
}: {
  site: SiteSettings;
  product?: Mattress;
}) {
  const [
    active,
    setActive
  ] =
    useState(0);

  const refs =
    useRef<
      (
        | HTMLDivElement
        | null
      )[]
    >([]);


  const settings = {
    enabled: true,
    eyebrow:
      "MATTRESS CONSTRUCTION",
    title:
      "Go beneath the surface.",
    body:
      "Explore the mattress from the first touch to the support underneath.",
    ...(site.layerStory ||
      {})
  };


  const productLayers =
    product?.layers ||
    [];


  useEffect(() => {
    if (
      active >=
      productLayers.length
    ) {
      setActive(0);
    }
  }, [
    active,
    productLayers.length
  ]);


  useEffect(() => {
    const observer =
      new IntersectionObserver(
        (
          entries
        ) => {
          let next =
            active;

          let best =
            0;

          for (
            const entry
            of entries
          ) {
            if (
              !entry.isIntersecting
            ) {
              continue;
            }

            const ratio =
              entry.intersectionRatio;

            if (
              ratio >
              best
            ) {
              best =
                ratio;

              next =
                Number(
                  entry.target.getAttribute(
                    "data-layer-index"
                  ) ||
                    0
                );
            }
          }

          if (
            best > 0
          ) {
            setActive(
              next
            );
          }
        },
        {
          threshold: [
            0.3,
            0.5,
            0.7
          ]
        }
      );

    refs.current.forEach(
      (node) => {
        if (node) {
          observer.observe(
            node
          );
        }
      }
    );

    return () =>
      observer.disconnect();
  }, [
    active,
    productLayers.length
  ]);


  const visual =
    useMemo(
      () =>
        productLayers.map(
          (
            layer,
            index
          ) => {
            const delta =
              index -
              active;

            return {
              ...layer,
              index,
              y:
                index *
                  54 -
                Math.max(
                  0,
                  active -
                    index +
                    1
                ) *
                  16,
              scale:
                1 -
                Math.abs(
                  delta
                ) *
                  0.012,
              opacity:
                index <=
                active
                  ? 1
                  : 0.74
            };
          }
        ),
      [
        productLayers,
        active
      ]
    );


  if (
    settings.enabled ===
      false ||
    !product ||
    !productLayers.length
  ) {
    return null;
  }


  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">

        <div className="max-w-4xl">

          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-black/42">
            {
              settings.eyebrow
            }
          </p>

          <h2 className="mt-5 text-[clamp(3.2rem,6vw,6rem)] font-medium leading-[0.88] tracking-[-0.055em] text-[#111111]">
            {
              settings.title
            }
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-7 text-black/55">
            {
              settings.body
            }
          </p>
        </div>


        <div className="mt-16 grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">

          <div className="space-y-4">

            {productLayers.map(
              (
                layer,
                index
              ) => (
                <div
                  key={
                    `${layer.name}-${index}`
                  }
                  ref={(
                    node
                  ) => {
                    refs.current[
                      index
                    ] =
                      node;
                  }}
                  data-layer-index={
                    index
                  }
                  className={`border-t py-9 transition ${
                    active ===
                    index
                      ? "border-black"
                      : "border-black/12"
                  }`}
                >

                  <div className="flex items-center gap-4">

                    <span className="text-[10px] font-semibold tracking-[0.25em] text-black/38">
                      {String(
                        index +
                          1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    {layer.material ? (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/38">
                        {
                          layer.material
                        }
                      </span>
                    ) : null}

                  </div>


                  <h3 className="mt-4 text-3xl font-medium tracking-[-0.04em]">
                    {
                      layer.name
                    }
                  </h3>


                  <p className="mt-4 max-w-xl text-sm leading-7 text-black/52">
                    {
                      layer.description
                    }
                  </p>


                  {layer.thickness ||
                  layer.density ? (
                    <div className="mt-5 flex flex-wrap gap-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/42">

                      {layer.thickness ? (
                        <span>
                          {
                            layer.thickness
                          }
                        </span>
                      ) : null}

                      {layer.density ? (
                        <span>
                          {
                            layer.density
                          }
                        </span>
                      ) : null}

                    </div>
                  ) : null}

                </div>
              )
            )}
          </div>


          <div className="lg:sticky lg:top-28 lg:h-fit">

            <div className="relative aspect-[5/4] overflow-hidden bg-[#F9F8F6]">

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,.9),transparent_50%)]" />

              {visual.map(
                (
                  layer
                ) => (
                  <div
                    key={
                      `${layer.name}-visual`
                    }
                    className="absolute left-[7%] right-[7%] top-[14%]"
                    style={{
                      zIndex:
                        productLayers.length -
                        layer.index,

                      transform:
                        `translateY(${layer.y}px) scale(${layer.scale})`,

                      opacity:
                        layer.opacity,

                      transition:
                        "transform 600ms cubic-bezier(.22,.61,.36,1), opacity 400ms ease"
                    }}
                  >

                    {layer.visualAsset ? (
                      <img
                        src={
                          layer.visualAsset
                        }
                        alt={
                          layer.name
                        }
                        className="h-[92px] w-full object-contain drop-shadow-[0_20px_16px_rgba(0,0,0,.13)] md:h-[120px]"
                      />
                    ) : (
                      <div
                        className="h-[74px] w-full rounded-[40px] shadow-[0_18px_28px_rgba(0,0,0,.10)] md:h-[90px]"
                        style={{
                          background:
                            fallbackFor(
                              layer.index
                            )
                        }}
                      />
                    )}

                  </div>
                )
              )}


              <div className="absolute inset-x-[18%] bottom-[12%] h-10 rounded-full bg-black/10 blur-2xl" />
            </div>


            <div className="border-x border-b border-black/10 bg-white px-5 py-5">

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-black/38">
                Active layer
              </p>

              <div className="mt-2 text-xl font-medium">
                {
                  productLayers[
                    active
                  ]?.name
                }
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

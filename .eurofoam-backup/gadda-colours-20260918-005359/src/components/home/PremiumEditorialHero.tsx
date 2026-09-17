"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
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
  direction:
    "left" |
    "right";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
    >
      <path
        d={
          direction ===
          "left"
            ? "M15 18 9 12l6-6"
            : "m9 18 6-6-6-6"
        }
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


export default function PremiumEditorialHero({
  site,
  products
}: {
  site: SiteSettings;
  products: Mattress[];
}) {
  const slides =
    useMemo<
      HeroSlide[]
    >(() => {
      const configured =
        (
          site.heroSlides ||
          []
        ).filter(
          (slide) =>
            slide.enabled !==
              false &&
            Boolean(
              slide.image
            )
        );

      if (
        configured.length
      ) {
        return configured;
      }

      return products
        .slice(0, 3)
        .map(
          (
            product,
            index
          ) => ({
            id:
              `fallback-${product.slug}`,
            image:
              product.image,
            imageAlt:
              product.name,
            href:
              `/mattresses/${product.slug}`,
            eyebrow:
              index === 0
                ? "BETTER SLEEP LIVES HERE"
                : product.kicker,
            title:
              product.name,
            body:
              product.shortDescription,
            ctaLabel:
              "Explore mattress",
            textTone:
              "light",
            imagePosition:
              "50% 50%",
            enabled:
              true
          })
        );
    }, [
      site.heroSlides,
      products
    ]);


  const [
    active,
    setActive
  ] =
    useState(0);


  useEffect(() => {
    if (
      slides.length <=
      1
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setActive(
            (current) =>
              (
                current +
                1
              ) %
              slides.length
          );
        },
        7000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [
    slides.length
  ]);


  useEffect(() => {
    if (
      active >=
      slides.length
    ) {
      setActive(0);
    }
  }, [
    active,
    slides.length
  ]);


  if (!slides.length) {
    return null;
  }


  const current =
    slides[
      Math.min(
        active,
        slides.length -
          1
      )
    ];

  const light =
    current.textTone !==
    "dark";

  const trust =
    site.trustItems?.length
      ? site.trustItems
      : [
          {
            id:
              "trial",
            value:
              "100",
            title:
              "NIGHT TRIAL",
            body:
              "Sleep on it at home before deciding."
          },
          {
            id:
              "warranty",
            value:
              "10+",
            title:
              "YEAR WARRANTY",
            body:
              "Long-term coverage on selected models."
          },
          {
            id:
              "shipping",
            value:
              "FREE",
            title:
              "SHIPPING",
            body:
              "Delivered directly to your door."
          }
        ];


  return (
    <section className="bg-[#F9F8F6]">
      <div className="mx-auto max-w-[1600px] px-0 lg:px-6 lg:pt-6">

        <div className="relative overflow-hidden bg-[#0D0D0D] lg:rounded-[10px]">

          <Link
            href={
              current.href
            }
            className="relative block min-h-[620px] overflow-hidden lg:min-h-[700px]"
          >

            <img
              key={
                current.image
              }
              src={
                current.image
              }
              alt={
                current.imageAlt ||
                current.title
              }
              className="absolute inset-0 h-full w-full object-cover transition duration-700"
              style={{
                objectPosition:
                  current.imagePosition ||
                  "50% 50%"
              }}
            />


            <div
              className={`absolute inset-0 ${
                light
                  ? "bg-[linear-gradient(90deg,rgba(8,8,8,.86)_0%,rgba(8,8,8,.63)_34%,rgba(8,8,8,.16)_69%,rgba(8,8,8,.08)_100%)]"
                  : "bg-[linear-gradient(90deg,rgba(249,248,246,.90)_0%,rgba(249,248,246,.65)_35%,rgba(249,248,246,.10)_75%)]"
              }`}
            />


            <div className="relative z-10 flex min-h-[620px] items-center px-8 py-16 sm:px-12 lg:min-h-[700px] lg:px-20">

              <div className="max-w-[720px]">

                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.38em] ${
                    light
                      ? "text-white/60"
                      : "text-black/45"
                  }`}
                >
                  EUROFOAM
                </p>


                {current.eyebrow ? (
                  <div className="mt-9 flex items-center gap-4">

                    <span
                      className={`h-px w-11 ${
                        light
                          ? "bg-[#C8B6A0]"
                          : "bg-black/30"
                      }`}
                    />

                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.34em] ${
                        light
                          ? "text-[#D7C5AF]"
                          : "text-black/55"
                      }`}
                    >
                      {
                        current.eyebrow
                      }
                    </p>

                  </div>
                ) : null}


                <h1
                  className={`mt-6 whitespace-pre-line text-[clamp(3.2rem,6.5vw,7rem)] font-medium leading-[0.88] tracking-[-0.055em] ${
                    light
                      ? "text-white"
                      : "text-[#111111]"
                  }`}
                >
                  {
                    current.title
                  }
                </h1>


                {current.body ? (
                  <p
                    className={`mt-7 max-w-xl text-base leading-7 sm:text-lg sm:leading-8 ${
                      light
                        ? "text-white/68"
                        : "text-black/62"
                    }`}
                  >
                    {
                      current.body
                    }
                  </p>
                ) : null}


                {current.ctaLabel ? (
                  <span
                    className={`mt-9 inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold transition ${
                      light
                        ? "bg-white text-[#111111]"
                        : "bg-[#111111] text-white"
                    }`}
                  >
                    {
                      current.ctaLabel
                    }

                    <span>
                      →
                    </span>
                  </span>
                ) : null}

              </div>
            </div>
          </Link>


          {slides.length >
          1 ? (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() =>
                  setActive(
                    (
                      active -
                      1 +
                      slides.length
                    ) %
                      slides.length
                  )
                }
                className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/22 bg-black/20 text-white backdrop-blur-md lg:left-7"
              >
                <Arrow direction="left" />
              </button>

              <button
                type="button"
                aria-label="Next slide"
                onClick={() =>
                  setActive(
                    (
                      active +
                      1
                    ) %
                      slides.length
                  )
                }
                className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/22 bg-black/20 text-white backdrop-blur-md lg:right-7"
              >
                <Arrow direction="right" />
              </button>

              <div className="absolute bottom-7 left-8 z-20 flex gap-2 lg:left-20">
                {slides.map(
                  (
                    slide,
                    index
                  ) => (
                    <button
                      key={
                        slide.id
                      }
                      type="button"
                      aria-label={`Slide ${
                        index +
                        1
                      }`}
                      onClick={() =>
                        setActive(
                          index
                        )
                      }
                      className={`h-[3px] rounded-full transition-all ${
                        index ===
                        active
                          ? "w-9 bg-white"
                          : "w-4 bg-white/35"
                      }`}
                    />
                  )
                )}
              </div>
            </>
          ) : null}
        </div>


        <div className="border-x border-b border-black/10 bg-white lg:rounded-b-[10px]">
          <div
            className={`grid ${
              trust.length === 4
                ? "md:grid-cols-4"
                : "md:grid-cols-3"
            }`}
          >
            {trust.map(
              (
                item,
                index
              ) => (
                <div
                  key={
                    item.id
                  }
                  className={`px-7 py-7 ${
                    index <
                    trust.length -
                      1
                      ? "border-b border-black/10 md:border-b-0 md:border-r"
                      : ""
                  }`}
                >
                  <div className="text-2xl font-medium tracking-[-0.035em] text-[#111111]">
                    {
                      item.value
                    }
                  </div>

                  <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-black/70">
                    {
                      item.title
                    }
                  </div>

                  {item.body ? (
                    <p className="mt-2 text-xs leading-5 text-black/46">
                      {
                        item.body
                      }
                    </p>
                  ) : null}
                </div>
              )
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

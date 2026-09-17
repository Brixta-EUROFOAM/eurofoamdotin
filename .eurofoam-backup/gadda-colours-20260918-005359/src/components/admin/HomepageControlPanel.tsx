"use client";

import type {
  HeroSlide,
  HomeBanner,
  HomeSectionVisibility,
  HomeTrustItem,
  Mattress,
  StoreData
} from "@/lib/catalog";


function clone<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value)
  );
}


async function uploadMedia(file: File) {
  const form = new FormData();

  form.append(
    "file",
    file
  );

  const response =
    await fetch(
      "/api/admin/upload",
      {
        method: "POST",
        body: form
      }
    );

  const body =
    await response.json();

  if (!response.ok) {
    throw new Error(
      body.error ||
      "Upload failed."
    );
  }

  return body.url as string;
}


function Label({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-ink/45">
      {children}
    </span>
  );
}


function Input(
  props:
    React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-gold-dark ${
        props.className || ""
      }`}
    />
  );
}


function TextArea(
  props:
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-gold-dark ${
        props.className || ""
      }`}
    />
  );
}


function Toggle({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-ink/10 bg-white px-4 py-3">
      <span className="text-sm font-bold">
        {label}
      </span>

      <span
        className={`relative h-6 w-11 rounded-full transition ${
          checked
            ? "bg-ink"
            : "bg-ink/15"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(
              event.target.checked
            )
          }
          className="sr-only"
        />

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>
    </label>
  );
}


function UploadField({
  value,
  onChange,
  label = "UPLOAD"
}: {
  value?: string;
  onChange: (
    value: string
  ) => void;
  label?: string;
}) {
  return (
    <div>
      <Input
        value={value || ""}
        placeholder="/media/... or https://..."
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-full bg-ink px-4 py-2 text-[10px] font-black text-white">
          {label}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (
              event
            ) => {
              const file =
                event.target
                  .files?.[0];

              if (!file) {
                return;
              }

              try {
                const url =
                  await uploadMedia(
                    file
                  );

                onChange(url);
              } catch (
                error
              ) {
                alert(
                  error instanceof
                    Error
                    ? error.message
                    : "Upload failed."
                );
              } finally {
                event.target.value =
                  "";
              }
            }}
          />
        </label>

        {value ? (
          <img
            src={value}
            alt=""
            className="h-20 w-32 rounded-lg border border-ink/10 bg-sand object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}


const defaultTrustItems:
  HomeTrustItem[] = [
    {
      id: "trial",
      value: "100",
      title: "NIGHT TRIAL",
      body:
        "Sleep on it at home before deciding."
    },
    {
      id: "warranty",
      value: "10+",
      title: "YEAR WARRANTY",
      body:
        "Long-term coverage on selected models."
    },
    {
      id: "shipping",
      value: "FREE",
      title: "SHIPPING",
      body:
        "Delivered directly to your door."
    }
  ];


const sectionNames:
  {
    key:
      keyof HomeSectionVisibility;
    label: string;
  }[] = [
    {
      key: "hero",
      label:
        "Premium hero"
    },
    {
      key:
        "layerStory",
      label:
        "Mattress layer experience"
    },
    {
      key:
        "newArrivals",
      label:
        "New arrivals"
    },
    {
      key:
        "shopByRooms",
      label:
        "Shop by rooms"
    },
    {
      key: "promos",
      label:
        "Campaign banners"
    },
    {
      key:
        "productGrid",
      label:
        "Main product grid"
    },
    {
      key:
        "sleepQuiz",
      label:
        "Sleep quiz"
    },
    {
      key: "reviews",
      label:
        "Customer reviews"
    }
  ];


export default function HomepageControlPanel({
  data,
  onChange
}: {
  data: StoreData;
  onChange: (
    next: StoreData
  ) => void;
}) {
  const site =
    data.site;

  const heroSlides =
    site.heroSlides || [];

  const homeSections =
    site.homeSections || {};

  const newArrivals = {
    enabled: true,
    eyebrow:
      "NEW ARRIVALS",
    title:
      "Latest from Eurofoam.",
    body:
      "New mattresses and sleep products, selected for the homepage.",
    viewAllLabel:
      "VIEW ALL",
    viewAllHref:
      "/mattresses",
    productSlugs:
      data.products
        .slice(0, 8)
        .map(
          (product) =>
            product.slug
        ),
    ...(site.newArrivals ||
      {})
  };

  const layerStory = {
    enabled: true,
    eyebrow:
      "MATTRESS CONSTRUCTION",
    title:
      "Go beneath the surface.",
    body:
      "Explore the mattress layer by layer.",
    productSlug:
      site.homeStoryProductSlug ||
      data.products[0]
        ?.slug ||
      "",
    ...(site.layerStory ||
      {})
  };

  const trustItems =
    site.trustItems?.length
      ? site.trustItems
      : defaultTrustItems;

  const banners =
    site.homeBanners || [];


  function replaceSite(
    patch:
      Partial<
        StoreData["site"]
      >
  ) {
    onChange({
      ...data,
      site: {
        ...data.site,
        ...patch
      }
    });
  }


  function updateProduct(
    slug: string,
    patch:
      Partial<Mattress>
  ) {
    const next =
      clone(data);

    const index =
      next.products.findIndex(
        (product) =>
          product.slug ===
          slug
      );

    if (index < 0) {
      return;
    }

    next.products[index] = {
      ...next.products[index],
      ...patch
    };

    onChange(next);
  }


  function setSections(
    patch:
      Partial<HomeSectionVisibility>
  ) {
    replaceSite({
      homeSections: {
        ...homeSections,
        ...patch
      }
    });
  }


  function updateHero(
    index: number,
    patch:
      Partial<HeroSlide>
  ) {
    const slides =
      clone(heroSlides);

    slides[index] = {
      ...slides[index],
      ...patch
    };

    replaceSite({
      heroSlides:
        slides
    });
  }


  function addHero() {
    replaceSite({
      heroSlides: [
        ...heroSlides,
        {
          id:
            `hero-${Date.now()}`,
          image: "",
          imageAlt: "",
          href:
            "/mattresses",
          eyebrow:
            "EUROFOAM",
          title:
            "New campaign",
          body: "",
          ctaLabel:
            "Explore",
          textTone:
            "light",
          contentAlign:
            "left",
          imagePosition:
            "50% 50%",
          enabled: true
        }
      ]
    });
  }


  function moveHero(
    index: number,
    direction:
      -1 | 1
  ) {
    const slides =
      clone(heroSlides);

    const target =
      index +
      direction;

    if (
      target < 0 ||
      target >=
        slides.length
    ) {
      return;
    }

    [
      slides[index],
      slides[target]
    ] = [
      slides[target],
      slides[index]
    ];

    replaceSite({
      heroSlides:
        slides
    });
  }


  function removeHero(
    index: number
  ) {
    replaceSite({
      heroSlides:
        heroSlides.filter(
          (_, itemIndex) =>
            itemIndex !==
            index
        )
    });
  }


  function setTrust(
    index: number,
    patch:
      Partial<HomeTrustItem>
  ) {
    const items =
      clone(trustItems);

    items[index] = {
      ...items[index],
      ...patch
    };

    replaceSite({
      trustItems:
        items
    });
  }


  function setNewArrivals(
    patch:
      Partial<
        typeof newArrivals
      >
  ) {
    replaceSite({
      newArrivals: {
        ...newArrivals,
        ...patch
      }
    });
  }


  function toggleArrival(
    slug: string
  ) {
    const current =
      newArrivals
        .productSlugs ||
      [];

    const exists =
      current.includes(
        slug
      );

    setNewArrivals({
      productSlugs:
        exists
          ? current.filter(
              (item) =>
                item !==
                slug
            )
          : [
              ...current,
              slug
            ]
    });
  }


  function moveArrival(
    slug: string,
    direction:
      -1 | 1
  ) {
    const current = [
      ...(
        newArrivals
          .productSlugs ||
        []
      )
    ];

    const index =
      current.indexOf(
        slug
      );

    const target =
      index +
      direction;

    if (
      index < 0 ||
      target < 0 ||
      target >=
        current.length
    ) {
      return;
    }

    [
      current[index],
      current[target]
    ] = [
      current[target],
      current[index]
    ];

    setNewArrivals({
      productSlugs:
        current
    });
  }


  function setLayerStory(
    patch:
      Partial<
        typeof layerStory
      >
  ) {
    replaceSite({
      layerStory: {
        ...layerStory,
        ...patch
      },

      ...(patch.productSlug
        ? {
            homeStoryProductSlug:
              patch.productSlug
          }
        : {})
    });
  }


  function updateBanner(
    index: number,
    patch:
      Partial<HomeBanner>
  ) {
    const next =
      clone(banners);

    next[index] = {
      ...next[index],
      ...patch
    };

    replaceSite({
      homeBanners:
        next
    });
  }


  function addBanner() {
    replaceSite({
      homeBanners: [
        ...banners,
        {
          id:
            `banner-${Date.now()}`,
          enabled: true,
          eyebrow:
            "EUROFOAM",
          title:
            "New campaign banner",
          body: "",
          ctaLabel:
            "Explore",
          href:
            "/mattresses",
          image: "",
          imagePosition:
            "50% 50%",
          theme:
            "light"
        }
      ]
    });
  }


  function removeBanner(
    index: number
  ) {
    replaceSite({
      homeBanners:
        banners.filter(
          (_, itemIndex) =>
            itemIndex !==
            index
        )
    });
  }


  function moveBanner(
    index: number,
    direction:
      -1 | 1
  ) {
    const next =
      clone(banners);

    const target =
      index +
      direction;

    if (
      target < 0 ||
      target >=
        next.length
    ) {
      return;
    }

    [
      next[index],
      next[target]
    ] = [
      next[target],
      next[index]
    ];

    replaceSite({
      homeBanners:
        next
    });
  }


  const layerProduct =
    data.products.find(
      (product) =>
        product.slug ===
        layerStory
          .productSlug
    ) ||
    data.products[0];


  return (
    <div className="space-y-8">

      {/* ========================================
          HOMEPAGE APPEARANCE
      ========================================= */}

      <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
          Homepage appearance
        </p>

        <h1 className="mt-2 font-display text-4xl">
          Colours.
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/55">
          Control the base background and text colour of the storefront homepage.
        </p>

        <div className="mt-7 grid gap-5 md:grid-cols-2">

          <label>
            <Label>Homepage background</Label>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={
                  site.homeBackground ||
                  "#000000"
                }
                onChange={(event) =>
                  replaceSite({
                    homeBackground:
                      event.target.value
                  })
                }
                className="h-12 w-16 cursor-pointer rounded-xl border border-ink/15 bg-white p-1"
              />

              <Input
                value={
                  site.homeBackground ||
                  "#000000"
                }
                onChange={(event) =>
                  replaceSite({
                    homeBackground:
                      event.target.value
                  })
                }
                placeholder="#000000"
              />
            </div>
          </label>


          <label>
            <Label>Homepage text</Label>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={
                  site.homeForeground ||
                  "#FFFFFF"
                }
                onChange={(event) =>
                  replaceSite({
                    homeForeground:
                      event.target.value
                  })
                }
                className="h-12 w-16 cursor-pointer rounded-xl border border-ink/15 bg-white p-1"
              />

              <Input
                value={
                  site.homeForeground ||
                  "#FFFFFF"
                }
                onChange={(event) =>
                  replaceSite({
                    homeForeground:
                      event.target.value
                  })
                }
                placeholder="#FFFFFF"
              />
            </div>
          </label>

        </div>


        <div className="mt-6 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() =>
              replaceSite({
                homeBackground: "#000000",
                homeForeground: "#FFFFFF"
              })
            }
            className="rounded-full bg-black px-5 py-2.5 text-xs font-black text-white"
          >
            BLACK
          </button>

          <button
            type="button"
            onClick={() =>
              replaceSite({
                homeBackground: "#F9F8F6",
                homeForeground: "#111111"
              })
            }
            className="rounded-full border border-ink/15 bg-[#F9F8F6] px-5 py-2.5 text-xs font-black text-black"
          >
            OFF-WHITE
          </button>

          <button
            type="button"
            onClick={() =>
              replaceSite({
                homeBackground: "#FFFFFF",
                homeForeground: "#111111"
              })
            }
            className="rounded-full border border-ink/15 bg-white px-5 py-2.5 text-xs font-black text-black"
          >
            WHITE
          </button>

        </div>


        <div
          className="mt-7 flex min-h-28 items-end rounded-xl border border-ink/10 p-5"
          style={{
            backgroundColor:
              site.homeBackground ||
              "#000000",
            color:
              site.homeForeground ||
              "#FFFFFF"
          }}
        >
          <span className="text-sm font-bold">
            Homepage colour preview
          </span>
        </div>
      </section>


      {/* ========================================
          SECTION VISIBILITY
      ========================================= */}

      <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
          Homepage control
        </p>

        <h1 className="mt-2 font-display text-4xl">
          Storefront modules.
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/55">
          Turn homepage sections on or off without touching code.
        </p>

        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {sectionNames.map(
            ({
              key,
              label
            }) => (
              <Toggle
                key={key}
                label={label}
                checked={
                  homeSections[
                    key
                  ] !== false
                }
                onChange={(
                  checked
                ) =>
                  setSections({
                    [key]:
                      checked
                  })
                }
              />
            )
          )}
        </div>
      </section>


      {/* ========================================
          ADVERTISING BAR
      ========================================= */}

      <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
          Advertising
        </p>

        <h2 className="mt-2 font-display text-4xl">
          Top announcement bar.
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/55">
          This controls the strip above the main header. Use it for free shipping, launches, seasonal offers or campaign links.
        </p>

        <div className="mt-7">
          <Toggle
            label="Show advertising bar"
            checked={
              site.announcementEnabled !==
              false
            }
            onChange={(
              value
            ) =>
              replaceSite({
                announcementEnabled:
                  value
              })
            }
          />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="md:col-span-2">
            <Label>
              Advertisement text
            </Label>

            <Input
              value={
                site.announcement ||
                ""
              }
              placeholder="FREE SHIPPING · EASY TRIALS · WARRANTY INCLUDED"
              onChange={(e) =>
                replaceSite({
                  announcement:
                    e.target.value
                })
              }
            />
          </label>

          <label>
            <Label>
              Click-through URL
            </Label>

            <Input
              value={
                site.announcementHref ||
                ""
              }
              placeholder="/mattresses or https://..."
              onChange={(e) =>
                replaceSite({
                  announcementHref:
                    e.target.value
                })
              }
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label>
              <Label>
                Background
              </Label>

              <div className="flex gap-2">
                <input
                  type="color"
                  value={
                    site.announcementBackground ||
                    "#FF7A00"
                  }
                  onChange={(e) =>
                    replaceSite({
                      announcementBackground:
                        e.target.value
                    })
                  }
                  className="h-12 w-14 rounded-lg border border-ink/10 bg-white p-1"
                />

                <Input
                  value={
                    site.announcementBackground ||
                    "#FF7A00"
                  }
                  onChange={(e) =>
                    replaceSite({
                      announcementBackground:
                        e.target.value
                    })
                  }
                />
              </div>
            </label>

            <label>
              <Label>
                Text colour
              </Label>

              <div className="flex gap-2">
                <input
                  type="color"
                  value={
                    site.announcementForeground ||
                    "#FFFFFF"
                  }
                  onChange={(e) =>
                    replaceSite({
                      announcementForeground:
                        e.target.value
                    })
                  }
                  className="h-12 w-14 rounded-lg border border-ink/10 bg-white p-1"
                />

                <Input
                  value={
                    site.announcementForeground ||
                    "#FFFFFF"
                  }
                  onChange={(e) =>
                    replaceSite({
                      announcementForeground:
                        e.target.value
                    })
                  }
                />
              </div>
            </label>
          </div>
        </div>

        <div
          className="mt-6 rounded-lg px-5 py-3 text-center text-xs font-black tracking-[0.12em]"
          style={{
            background:
              site.announcementBackground ||
              "#FF7A00",

            color:
              site.announcementForeground ||
              "#FFFFFF"
          }}
        >
          {site.announcement ||
            "YOUR ADVERTISEMENT"}
        </div>
      </section>


      {/* ========================================
          HERO SLIDES
      ========================================= */}

      <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
              Homepage hero
            </p>

            <h2 className="mt-2 font-display text-4xl">
              Hero campaigns.
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/55">
              Every slide can have its own image, copy, CTA and destination. The entire banner is clickable.
            </p>
          </div>

          <button
            type="button"
            onClick={addHero}
            className="rounded-full bg-ink px-5 py-3 text-xs font-black text-white"
          >
            + HERO SLIDE
          </button>
        </div>

        <div className="mt-7 space-y-5">
          {heroSlides.map(
            (
              slide,
              index
            ) => (
              <div
                key={
                  slide.id
                }
                className="rounded-[1.3rem] border border-ink/10 bg-sand/45 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gold-dark">
                      Slide{" "}
                      {String(
                        index +
                          1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <div className="mt-1 text-lg font-black">
                      {slide.title ||
                        "Untitled slide"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={
                        index === 0
                      }
                      onClick={() =>
                        moveHero(
                          index,
                          -1
                        )
                      }
                      className="rounded-full border border-ink/15 px-3 py-2 text-xs font-black disabled:opacity-25"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      disabled={
                        index ===
                        heroSlides.length -
                          1
                      }
                      onClick={() =>
                        moveHero(
                          index,
                          1
                        )
                      }
                      className="rounded-full border border-ink/15 px-3 py-2 text-xs font-black disabled:opacity-25"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeHero(
                          index
                        )
                      }
                      className="rounded-full border border-red-200 px-3 py-2 text-xs font-black text-red-700"
                    >
                      DELETE
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">

                  <div className="lg:col-span-2">
                    <Label>
                      Hero image
                    </Label>

                    <UploadField
                      value={
                        slide.image
                      }
                      label="UPLOAD 4K HERO"
                      onChange={(
                        image
                      ) =>
                        updateHero(
                          index,
                          {
                            image
                          }
                        )
                      }
                    />
                  </div>

                  <label>
                    <Label>
                      Eyebrow
                    </Label>

                    <Input
                      value={
                        slide.eyebrow ||
                        ""
                      }
                      onChange={(e) =>
                        updateHero(
                          index,
                          {
                            eyebrow:
                              e.target
                                .value
                          }
                        )
                      }
                    />
                  </label>

                  <label>
                    <Label>
                      Destination
                    </Label>

                    <Input
                      value={
                        slide.href
                      }
                      placeholder="/mattresses/euro-align"
                      onChange={(e) =>
                        updateHero(
                          index,
                          {
                            href:
                              e.target
                                .value
                          }
                        )
                      }
                    />
                  </label>

                  <label className="lg:col-span-2">
                    <Label>
                      Headline
                    </Label>

                    <TextArea
                      rows={2}
                      value={
                        slide.title
                      }
                      onChange={(e) =>
                        updateHero(
                          index,
                          {
                            title:
                              e.target
                                .value
                          }
                        )
                      }
                    />
                  </label>

                  <label className="lg:col-span-2">
                    <Label>
                      Supporting copy
                    </Label>

                    <TextArea
                      rows={3}
                      value={
                        slide.body ||
                        ""
                      }
                      onChange={(e) =>
                        updateHero(
                          index,
                          {
                            body:
                              e.target
                                .value
                          }
                        )
                      }
                    />
                  </label>

                  <label>
                    <Label>
                      CTA label
                    </Label>

                    <Input
                      value={
                        slide.ctaLabel ||
                        ""
                      }
                      onChange={(e) =>
                        updateHero(
                          index,
                          {
                            ctaLabel:
                              e.target
                                .value
                          }
                        )
                      }
                    />
                  </label>

                  <label>
                    <Label>
                      Image position
                    </Label>

                    <Input
                      value={
                        slide.imagePosition ||
                        "50% 50%"
                      }
                      placeholder="70% 50%"
                      onChange={(e) =>
                        updateHero(
                          index,
                          {
                            imagePosition:
                              e.target
                                .value
                          }
                        )
                      }
                    />
                  </label>

                  <label>
                    <Label>
                      Text colour mode
                    </Label>

                    <select
                      value={
                        slide.textTone ||
                        "light"
                      }
                      onChange={(e) =>
                        updateHero(
                          index,
                          {
                            textTone:
                              e.target
                                .value as
                                | "light"
                                | "dark"
                          }
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm"
                    >
                      <option value="light">
                        Light text
                      </option>

                      <option value="dark">
                        Dark text
                      </option>
                    </select>
                  </label>

                  <Toggle
                    label="Slide enabled"
                    checked={
                      slide.enabled !==
                      false
                    }
                    onChange={(
                      enabled
                    ) =>
                      updateHero(
                        index,
                        {
                          enabled
                        }
                      )
                    }
                  />

                </div>
              </div>
            )
          )}

          {!heroSlides.length ? (
            <div className="rounded-xl border border-dashed border-ink/20 p-8 text-center text-sm text-ink/45">
              No custom hero slides yet. Add one above.
            </div>
          ) : null}
        </div>
      </section>


      {/* ========================================
          TRUST STRIP
      ========================================= */}

      <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">

        <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
          Hero trust strip
        </p>

        <h2 className="mt-2 font-display text-4xl">
          Trial, warranty and delivery.
        </h2>

        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {trustItems.map(
            (
              item,
              index
            ) => (
              <div
                key={
                  item.id
                }
                className="rounded-xl border border-ink/10 bg-sand/40 p-4"
              >
                <label>
                  <Label>
                    Value
                  </Label>

                  <Input
                    value={
                      item.value
                    }
                    onChange={(e) =>
                      setTrust(
                        index,
                        {
                          value:
                            e.target
                              .value
                        }
                      )
                    }
                  />
                </label>

                <label className="mt-4 block">
                  <Label>
                    Title
                  </Label>

                  <Input
                    value={
                      item.title
                    }
                    onChange={(e) =>
                      setTrust(
                        index,
                        {
                          title:
                            e.target
                              .value
                        }
                      )
                    }
                  />
                </label>

                <label className="mt-4 block">
                  <Label>
                    Copy
                  </Label>

                  <TextArea
                    rows={2}
                    value={
                      item.body ||
                      ""
                    }
                    onChange={(e) =>
                      setTrust(
                        index,
                        {
                          body:
                            e.target
                              .value
                        }
                      )
                    }
                  />
                </label>
              </div>
            )
          )}
        </div>
      </section>


      {/* ========================================
          NEW ARRIVALS
      ========================================= */}

      <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">

        <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
          Merchandising
        </p>

        <h2 className="mt-2 font-display text-4xl">
          New Arrivals.
        </h2>

        <div className="mt-7 grid gap-5 md:grid-cols-2">

          <Toggle
            label="Show New Arrivals"
            checked={
              newArrivals.enabled !==
              false
            }
            onChange={(
              enabled
            ) =>
              setNewArrivals({
                enabled
              })
            }
          />

          <label>
            <Label>
              View-all URL
            </Label>

            <Input
              value={
                newArrivals.viewAllHref
              }
              onChange={(e) =>
                setNewArrivals({
                  viewAllHref:
                    e.target.value
                })
              }
            />
          </label>

          <label>
            <Label>
              Eyebrow
            </Label>

            <Input
              value={
                newArrivals.eyebrow
              }
              onChange={(e) =>
                setNewArrivals({
                  eyebrow:
                    e.target.value
                })
              }
            />
          </label>

          <label>
            <Label>
              View-all label
            </Label>

            <Input
              value={
                newArrivals.viewAllLabel
              }
              onChange={(e) =>
                setNewArrivals({
                  viewAllLabel:
                    e.target.value
                })
              }
            />
          </label>

          <label className="md:col-span-2">
            <Label>
              Heading
            </Label>

            <Input
              value={
                newArrivals.title
              }
              onChange={(e) =>
                setNewArrivals({
                  title:
                    e.target.value
                })
              }
            />
          </label>

          <label className="md:col-span-2">
            <Label>
              Description
            </Label>

            <TextArea
              rows={3}
              value={
                newArrivals.body
              }
              onChange={(e) =>
                setNewArrivals({
                  body:
                    e.target.value
                })
              }
            />
          </label>
        </div>


        <div className="mt-8 border-t border-ink/10 pt-7">
          <div className="text-sm font-black">
            Products shown in New Arrivals
          </div>

          <p className="mt-2 text-xs leading-5 text-ink/45">
            Select products and arrange their storefront order.
          </p>


          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.products.map(
              (
                product
              ) => {
                const selected =
                  (
                    newArrivals
                      .productSlugs ||
                    []
                  ).includes(
                    product.slug
                  );

                return (
                  <div
                    key={
                      product.slug
                    }
                    className={`rounded-xl border p-4 ${
                      selected
                        ? "border-ink bg-sand/65"
                        : "border-ink/10 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">

                      <img
                        src={
                          product.image
                        }
                        alt=""
                        className="h-14 w-16 rounded-lg bg-sand object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black">
                          {
                            product.name
                          }
                        </div>

                        <div className="mt-1 text-xs text-ink/45">
                          {
                            product.category
                          }
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={
                          selected
                        }
                        onChange={() =>
                          toggleArrival(
                            product.slug
                          )
                        }
                        className="h-4 w-4"
                      />
                    </div>

                    {selected ? (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            moveArrival(
                              product.slug,
                              -1
                            )
                          }
                          className="rounded-full border border-ink/15 px-3 py-1.5 text-[10px] font-black"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveArrival(
                              product.slug,
                              1
                            )
                          }
                          className="rounded-full border border-ink/15 px-3 py-1.5 text-[10px] font-black"
                        >
                          ↓
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>


      {/* ========================================
          LAYER STORY
      ========================================= */}

      <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">

        <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
          Cinematic construction
        </p>

        <h2 className="mt-2 font-display text-4xl">
          Mattress layer story.
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/55">
          Choose the mattress used by the scroll experience, edit the copy and upload isolated layer renders directly here.
        </p>

        <div className="mt-7 grid gap-5 md:grid-cols-2">

          <Toggle
            label="Show layer experience"
            checked={
              layerStory.enabled !==
              false
            }
            onChange={(
              enabled
            ) =>
              setLayerStory({
                enabled
              })
            }
          />

          <label>
            <Label>
              Mattress used
            </Label>

            <select
              value={
                layerStory.productSlug
              }
              onChange={(e) =>
                setLayerStory({
                  productSlug:
                    e.target.value
                })
              }
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm"
            >
              {data.products.map(
                (
                  product
                ) => (
                  <option
                    key={
                      product.slug
                    }
                    value={
                      product.slug
                    }
                  >
                    {
                      product.name
                    }
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <Label>
              Eyebrow
            </Label>

            <Input
              value={
                layerStory.eyebrow
              }
              onChange={(e) =>
                setLayerStory({
                  eyebrow:
                    e.target.value
                })
              }
            />
          </label>

          <label>
            <Label>
              Heading
            </Label>

            <Input
              value={
                layerStory.title
              }
              onChange={(e) =>
                setLayerStory({
                  title:
                    e.target.value
                })
              }
            />
          </label>

          <label className="md:col-span-2">
            <Label>
              Introduction
            </Label>

            <TextArea
              rows={3}
              value={
                layerStory.body
              }
              onChange={(e) =>
                setLayerStory({
                  body:
                    e.target.value
                })
              }
            />
          </label>
        </div>


        {layerProduct ? (
          <div className="mt-8 border-t border-ink/10 pt-7">

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-black">
                  {
                    layerProduct.name
                  }{" "}
                  layers
                </div>

                <p className="mt-1 text-xs text-ink/45">
                  Transparent PNG or WebP works best. Keep all layers on the same perspective and canvas ratio.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {layerProduct.layers.map(
                (
                  layer,
                  index
                ) => (
                  <div
                    key={
                      `${layer.name}-${index}`
                    }
                    className="rounded-xl border border-ink/10 bg-sand/40 p-5"
                  >
                    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gold-dark">
                          Layer{" "}
                          {String(
                            index +
                              1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <label className="mt-4 block">
                          <Label>
                            Layer name
                          </Label>

                          <Input
                            value={
                              layer.name
                            }
                            onChange={(e) => {
                              const nextLayers =
                                clone(
                                  layerProduct.layers
                                );

                              nextLayers[
                                index
                              ].name =
                                e.target.value;

                              updateProduct(
                                layerProduct.slug,
                                {
                                  layers:
                                    nextLayers
                                }
                              );
                            }}
                          />
                        </label>

                        <label className="mt-4 block">
                          <Label>
                            Customer explanation
                          </Label>

                          <TextArea
                            rows={3}
                            value={
                              layer.description
                            }
                            onChange={(e) => {
                              const nextLayers =
                                clone(
                                  layerProduct.layers
                                );

                              nextLayers[
                                index
                              ].description =
                                e.target.value;

                              updateProduct(
                                layerProduct.slug,
                                {
                                  layers:
                                    nextLayers
                                }
                              );
                            }}
                          />
                        </label>
                      </div>

                      <div>
                        <Label>
                          Cinematic layer render
                        </Label>

                        <UploadField
                          value={
                            layer.visualAsset ||
                            ""
                          }
                          label="UPLOAD LAYER"
                          onChange={(
                            visualAsset
                          ) => {
                            const nextLayers =
                              clone(
                                layerProduct.layers
                              );

                            nextLayers[
                              index
                            ].visualAsset =
                              visualAsset;

                            updateProduct(
                              layerProduct.slug,
                              {
                                layers:
                                  nextLayers
                              }
                            );
                          }}
                        />

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <label>
                            <Label>
                              Material
                            </Label>

                            <Input
                              value={
                                layer.material ||
                                ""
                              }
                              placeholder="Open-cell HR foam"
                              onChange={(e) => {
                                const nextLayers =
                                  clone(
                                    layerProduct.layers
                                  );

                                nextLayers[
                                  index
                                ].material =
                                  e.target.value;

                                updateProduct(
                                  layerProduct.slug,
                                  {
                                    layers:
                                      nextLayers
                                  }
                                );
                              }}
                            />
                          </label>

                          <label>
                            <Label>
                              Thickness
                            </Label>

                            <Input
                              value={
                                layer.thickness ||
                                ""
                              }
                              placeholder="40 mm"
                              onChange={(e) => {
                                const nextLayers =
                                  clone(
                                    layerProduct.layers
                                  );

                                nextLayers[
                                  index
                                ].thickness =
                                  e.target.value;

                                updateProduct(
                                  layerProduct.slug,
                                  {
                                    layers:
                                      nextLayers
                                  }
                                );
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ) : null}
      </section>


      {/* ========================================
          CAMPAIGN BANNERS
      ========================================= */}

      <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
              Feature banners
            </p>

            <h2 className="mt-2 font-display text-4xl">
              Homepage campaigns.
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/55">
              Build premium editorial banners for launches, collections, offers or individual mattresses.
            </p>
          </div>

          <button
            type="button"
            onClick={
              addBanner
            }
            className="rounded-full bg-ink px-5 py-3 text-xs font-black text-white"
          >
            + BANNER
          </button>
        </div>


        <div className="mt-7 space-y-5">
          {banners.map(
            (
              banner,
              index
            ) => (
              <div
                key={
                  banner.id
                }
                className="rounded-xl border border-ink/10 bg-sand/40 p-5"
              >

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-black">
                    {banner.title ||
                      `Banner ${index + 1}`}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        moveBanner(
                          index,
                          -1
                        )
                      }
                      className="rounded-full border border-ink/15 px-3 py-2 text-xs font-black"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        moveBanner(
                          index,
                          1
                        )
                      }
                      className="rounded-full border border-ink/15 px-3 py-2 text-xs font-black"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeBanner(
                          index
                        )
                      }
                      className="rounded-full border border-red-200 px-3 py-2 text-xs font-black text-red-700"
                    >
                      DELETE
                    </button>
                  </div>
                </div>


                <div className="mt-5 grid gap-5 md:grid-cols-2">

                  <div className="md:col-span-2">
                    <Label>
                      Campaign image
                    </Label>

                    <UploadField
                      value={
                        banner.image ||
                        ""
                      }
                      label="UPLOAD BANNER"
                      onChange={(
                        image
                      ) =>
                        updateBanner(
                          index,
                          {
                            image
                          }
                        )
                      }
                    />
                  </div>

                  <label>
                    <Label>
                      Eyebrow
                    </Label>

                    <Input
                      value={
                        banner.eyebrow ||
                        ""
                      }
                      onChange={(e) =>
                        updateBanner(
                          index,
                          {
                            eyebrow:
                              e.target
                                .value
                          }
                        )
                      }
                    />
                  </label>

                  <label>
                    <Label>
                      Link
                    </Label>

                    <Input
                      value={
                        banner.href
                      }
                      onChange={(e) =>
                        updateBanner(
                          index,
                          {
                            href:
                              e.target
                                .value
                          }
                        )
                      }
                    />
                  </label>

                  <label className="md:col-span-2">
                    <Label>
                      Headline
                    </Label>

                    <Input
                      value={
                        banner.title
                      }
                      onChange={(e) =>
                        updateBanner(
                          index,
                          {
                            title:
                              e.target
                                .value
                          }
                        )
                      }
                    />
                  </label>

                  <label className="md:col-span-2">
                    <Label>
                      Body
                    </Label>

                    <TextArea
                      rows={3}
                      value={
                        banner.body ||
                        ""
                      }
                      onChange={(e) =>
                        updateBanner(
                          index,
                          {
                            body:
                              e.target
                                .value
                          }
                        )
                      }
                    />
                  </label>

                  <label>
                    <Label>
                      CTA
                    </Label>

                    <Input
                      value={
                        banner.ctaLabel ||
                        ""
                      }
                      onChange={(e) =>
                        updateBanner(
                          index,
                          {
                            ctaLabel:
                              e.target
                                .value
                          }
                        )
                      }
                    />
                  </label>

                  <label>
                    <Label>
                      Image position
                    </Label>

                    <Input
                      value={
                        banner.imagePosition ||
                        "50% 50%"
                      }
                      onChange={(e) =>
                        updateBanner(
                          index,
                          {
                            imagePosition:
                              e.target
                                .value
                          }
                        )
                      }
                    />
                  </label>

                  <label>
                    <Label>
                      Theme
                    </Label>

                    <select
                      value={
                        banner.theme ||
                        "light"
                      }
                      onChange={(e) =>
                        updateBanner(
                          index,
                          {
                            theme:
                              e.target
                                .value as
                                | "light"
                                | "dark"
                          }
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm"
                    >
                      <option value="light">
                        Light
                      </option>

                      <option value="dark">
                        Dark
                      </option>
                    </select>
                  </label>

                  <Toggle
                    label="Banner enabled"
                    checked={
                      banner.enabled !==
                      false
                    }
                    onChange={(
                      enabled
                    ) =>
                      updateBanner(
                        index,
                        {
                          enabled
                        }
                      )
                    }
                  />
                </div>
              </div>
            )
          )}

          {!banners.length ? (
            <div className="rounded-xl border border-dashed border-ink/20 p-8 text-center text-sm text-ink/45">
              No custom feature banners yet.
            </div>
          ) : null}
        </div>
      </section>

    </div>
  );
}

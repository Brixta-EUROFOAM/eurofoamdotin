import Link from "next/link";

import type {
  HomeBanner,
  Mattress,
  SiteSettings
} from "@/lib/catalog";


export default function PromoBanners({
  products,
  site
}: {
  products: Mattress[];
  site: SiteSettings;
}) {
  const fallback:
    HomeBanner[] = [
      {
        id:
          "fallback-value",
        enabled: true,
        eyebrow:
          "EUROFOAM VALUE",
        title:
          "Direct comfort. Clearer decisions.",
        body:
          "Thoughtful construction, considered materials and delivery directly to your door.",
        ctaLabel:
          "Explore mattresses",
        href:
          "/mattresses",
        image:
          products[0]
            ?.image,
        theme:
          "light",
        imagePosition:
          "50% 50%"
      }
    ];


  const banners =
    (
      site.homeBanners?.length
        ? site.homeBanners
        : fallback
    ).filter(
      (banner) =>
        banner.enabled !==
        false
    );


  if (!banners.length) {
    return null;
  }


  return (
    <section className="bg-white">

      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">

        <div className="space-y-8">

          {banners.map(
            (
              banner,
              index
            ) => {
              const dark =
                banner.theme ===
                "dark";

              return (
                <Link
                  key={
                    banner.id
                  }
                  href={
                    banner.href
                  }
                  className={`group grid overflow-hidden rounded-[10px] border border-black/10 lg:grid-cols-[0.86fr_1.14fr] ${
                    dark
                      ? "bg-[#0D0D0D] text-white"
                      : "bg-[#F9F8F6] text-[#111111]"
                  }`}
                >

                  <div className="flex items-center px-8 py-12 sm:px-12 lg:px-14 lg:py-16">

                    <div className="max-w-xl">

                      {banner.eyebrow ? (
                        <p
                          className={`text-[10px] font-semibold uppercase tracking-[0.30em] ${
                            dark
                              ? "text-[#C7B59E]"
                              : "text-black/42"
                          }`}
                        >
                          {
                            banner.eyebrow
                          }
                        </p>
                      ) : null}


                      <h3 className="mt-5 text-[clamp(2.8rem,5vw,5.2rem)] font-medium leading-[0.9] tracking-[-0.055em]">
                        {
                          banner.title
                        }
                      </h3>


                      {banner.body ? (
                        <p
                          className={`mt-6 max-w-lg text-base leading-7 ${
                            dark
                              ? "text-white/60"
                              : "text-black/55"
                          }`}
                        >
                          {
                            banner.body
                          }
                        </p>
                      ) : null}


                      {banner.ctaLabel ? (
                        <span
                          className={`mt-8 inline-flex items-center gap-3 border-b pb-2 text-sm font-semibold ${
                            dark
                              ? "border-white/60"
                              : "border-black/60"
                          }`}
                        >
                          {
                            banner.ctaLabel
                          }

                          <span>
                            →
                          </span>
                        </span>
                      ) : null}

                    </div>
                  </div>


                  <div className="relative min-h-[330px] overflow-hidden lg:min-h-[480px]">

                    {banner.image ? (
                      <img
                        src={
                          banner.image
                        }
                        alt={
                          banner.title
                        }
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                        style={{
                          objectPosition:
                            banner.imagePosition ||
                            "50% 50%"
                        }}
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 ${
                          dark
                            ? "bg-[#181818]"
                            : "bg-[#EEECE8]"
                        }`}
                      />
                    )}

                    <div
                      className={`absolute inset-0 ${
                        dark
                          ? "bg-[linear-gradient(90deg,rgba(13,13,13,.24),transparent_45%)]"
                          : "bg-[linear-gradient(90deg,rgba(249,248,246,.20),transparent_45%)]"
                      }`}
                    />
                  </div>

                </Link>
              );
            }
          )}

        </div>
      </div>
    </section>
  );
}

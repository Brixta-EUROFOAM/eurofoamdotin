import Link from "next/link";

import type {
  Mattress,
  SiteSettings
} from "@/lib/catalog";

import {
  money
} from "@/lib/catalog";


export default function NewArrivalsSection({
  products,
  site
}: {
  products: Mattress[];
  site: SiteSettings;
}) {
  const settings = {
    enabled: true,
    eyebrow:
      "NEW ARRIVALS",
    title:
      "Latest from Eurofoam.",
    body:
      "New mattresses and sleep products selected for the homepage.",
    viewAllLabel:
      "VIEW ALL",
    viewAllHref:
      "/mattresses",
    productSlugs:
      products
        .slice(0, 8)
        .map(
          (product) =>
            product.slug
        ),
    ...(site.newArrivals ||
      {})
  };


  if (
    settings.enabled ===
    false
  ) {
    return null;
  }


  const bySlug =
    new Map(
      products.map(
        (product) => [
          product.slug,
          product
        ]
      )
    );


  const selected =
    (
      settings
        .productSlugs ||
      []
    )
      .map(
        (slug) =>
          bySlug.get(slug)
      )
      .filter(
        Boolean
      ) as Mattress[];


  const items =
    selected.length
      ? selected
      : products.slice(
          0,
          8
        );


  return (
    <section className="bg-[#F9F8F6]">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.30em] text-black/46">
              {
                settings.eyebrow
              }
            </p>

            <h2 className="mt-4 max-w-3xl text-[clamp(2.8rem,5vw,5rem)] font-medium leading-[0.92] tracking-[-0.05em] text-[#111111]">
              {
                settings.title
              }
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
              {
                settings.body
              }
            </p>
          </div>


          <Link
            href={
              settings.viewAllHref
            }
            className="inline-flex items-center gap-3 border-b border-black/60 pb-2 text-sm font-semibold"
          >
            {
              settings.viewAllLabel
            }

            <span>
              →
            </span>
          </Link>
        </div>


        <div className="mt-10 overflow-x-auto pb-5">

          <div className="flex min-w-max gap-5">

            {items.map(
              (
                product
              ) => (
                <Link
                  key={
                    product.slug
                  }
                  href={`/mattresses/${product.slug}`}
                  className="group w-[290px]"
                >

                  <div className="aspect-[4/4.35] overflow-hidden rounded-[8px] bg-[#EEECE8]">
                    <img
                      src={
                        product.image
                      }
                      alt={
                        product.name
                      }
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                    />
                  </div>


                  <div className="pt-5">

                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-black/42">
                      {
                        product.category
                      }
                    </p>

                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                      {
                        product.name
                      }
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-black/52">
                      {
                        product.shortDescription
                      }
                    </p>

                    <p className="mt-4 text-lg font-semibold">
                      From{" "}
                      {
                        money(
                          product.basePrice
                        )
                      }
                    </p>
                  </div>

                </Link>
              )
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

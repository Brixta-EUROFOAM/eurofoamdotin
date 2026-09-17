import Link from "next/link";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";

import LayerScrollStory from "@/components/home/LayerScrollStory";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
import PremiumEditorialHero from "@/components/home/PremiumEditorialHero";
import PromoBanners from "@/components/home/PromoBanners";
import ShopByRooms from "@/components/home/ShopByRooms";

import {
  getStoreData
} from "@/lib/store";


export const dynamic =
  "force-dynamic";


export default async function Home() {
  const {
    site,
    products,
    reviews
  } =
    await getStoreData();


  const sections =
    site.homeSections ||
    {};


  const storySlug =
    site.layerStory
      ?.productSlug ||
    site.homeStoryProductSlug;


  const storyProduct =
    products.find(
      (product) =>
        product.slug ===
        storySlug
    ) ||
    products[0];


  return (
    <>
      <Header />

      <main
        style={{
          backgroundColor:
            site.homeBackground ||
            "#000000",
          color:
            site.homeForeground ||
            "#FFFFFF"
        }}
      >

        {sections.hero !==
        false ? (
          <PremiumEditorialHero
            site={site}
            products={products}
          />
        ) : null}


        {sections.layerStory !==
          false &&
        site.layerStory
          ?.enabled !==
          false ? (
          <LayerScrollStory
            site={site}
            product={
              storyProduct
            }
          />
        ) : null}


        {sections.newArrivals !==
          false ? (
          <NewArrivalsSection
            products={
              products
            }
            site={site}
          />
        ) : null}


        {sections.shopByRooms !==
        false ? (
          <ShopByRooms
            products={
              products
            }
          />
        ) : null}


        {sections.promos !==
        false ? (
          <PromoBanners
            products={
              products
            }
            site={site}
          />
        ) : null}


        {sections.productGrid !==
        false ? (
          <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.30em] opacity-45">
                  EUROFOAM COLLECTION
                </p>

                <h2 className="mt-4 max-w-3xl text-[clamp(3rem,5.5vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.055em]">
                  Choose the feel that suits you.
                </h2>
              </div>

              <Link
                href="/compare"
                className="text-sm font-semibold underline underline-offset-4"
              >
                COMPARE ALL →
              </Link>
            </div>


            <div className="mt-12 grid gap-6 md:grid-cols-2">

              {products.map(
                (
                  mattress
                ) => (
                  <ProductCard
                    key={
                      mattress.slug
                    }
                    mattress={
                      mattress
                    }
                  />
                )
              )}

            </div>
          </section>
        ) : null}


        {sections.sleepQuiz !==
        false ? (
          <section className="bg-[#F9F8F6] text-black">

            <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.30em] opacity-45">
                  FIND YOUR MATCH
                </p>

                <h2 className="mt-4 text-[clamp(3rem,5.5vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.055em]">
                  Start with how you sleep.
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-black/55">
                  Sleep position, heat sensitivity, feel preference and budget. Four questions, one practical starting point.
                </p>

                <Link
                  href="/sleep-quiz"
                  className="mt-8 inline-flex rounded-full bg-[#111111] px-6 py-3.5 text-sm font-semibold text-white"
                >
                  START THE QUIZ →
                </Link>
              </div>


              <div className="grid grid-cols-2 gap-px overflow-hidden border border-black/10 bg-black/10">

                {[
                  "SIDE",
                  "BACK",
                  "HOT",
                  "COUPLE"
                ].map(
                  (
                    word
                  ) => (
                    <div
                      key={
                        word
                      }
                      className="flex aspect-square items-end bg-white p-6"
                    >
                      <span className="text-2xl font-medium tracking-[-0.03em]">
                        {
                          word
                        }
                      </span>
                    </div>
                  )
                )}

              </div>
            </div>
          </section>
        ) : null}


        {sections.reviews !==
          false &&
        reviews.length ? (
          <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.30em] opacity-45">
                CUSTOMER PROOF
              </p>

              <h2 className="mt-4 text-[clamp(3rem,5vw,5rem)] font-medium leading-[0.92] tracking-[-0.05em]">
                What sleepers say.
              </h2>
            </div>


            <div className="mt-10 grid gap-px overflow-hidden border border-black/10 bg-black/10 md:grid-cols-3">

              {reviews
                .slice(
                  0,
                  3
                )
                .map(
                  (
                    review
                  ) => (
                    <blockquote
                      key={
                        review.id
                      }
                      className="bg-white p-7 text-black"
                    >

                      <div className="text-sm tracking-[0.12em]">
                        {"★".repeat(
                          Math.max(
                            1,
                            Math.min(
                              5,
                              review.stars
                            )
                          )
                        )}
                      </div>

                      <p className="mt-6 text-lg leading-8">
                        “
                        {
                          review.quote
                        }
                        ”
                      </p>

                      <footer className="mt-8 border-t border-black/10 pt-5 text-sm">

                        <strong>
                          {
                            review.name
                          }
                        </strong>

                        <div className="mt-1 opacity-45">
                          {
                            review.product
                          }
                        </div>

                      </footer>
                    </blockquote>
                  )
                )}

            </div>
          </section>
        ) : null}

      </main>

      <Footer />
    </>
  );
}

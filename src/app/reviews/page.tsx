import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const { reviews } = await getStoreData();

  return (
    <>
      <Header />

      <main className="bg-[#F3ECDD] text-[#111]">

        <section className="mx-auto max-w-[1500px] px-5 py-16 lg:px-10 lg:py-28">

          <div className="border-b-2 border-black pb-8">

            <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#FF6500]">
              LOG KYA BOLENGE!!!???
            </p>

            <h1 className="mt-5 max-w-5xl font-display text-[clamp(4.5rem,10vw,10rem)] leading-[.78] tracking-[-.075em]">
              SOYE.
              <br />
              PHIR BOLE.
            </h1>

          </div>


          <div className="grid md:grid-cols-2 xl:grid-cols-3">

            {reviews.map((review, index) => (

              <article
                key={review.id}
                className="relative min-h-[430px] border-b border-r border-black p-7 lg:p-9"
              >

                <div className="flex items-start justify-between">

                  <span className="text-xs font-black tracking-[.15em]">
                    0{index + 1}
                  </span>

                  <span className="text-[#FF6500]">
                    {"★".repeat(
                      Math.max(
                        1,
                        Math.min(5, review.stars)
                      )
                    )}
                  </span>

                </div>


                <p className="mt-16 text-[clamp(1.4rem,2vw,2rem)] font-semibold leading-[1.25] tracking-[-.025em]">
                  “{review.quote}”
                </p>


                <div className="absolute bottom-7 left-7 right-7 border-t border-black/30 pt-5 lg:bottom-9 lg:left-9 lg:right-9">

                  <strong className="text-sm">
                    {review.name}
                  </strong>

                  <div className="mt-1 text-xs uppercase tracking-[.12em] opacity-45">
                    {review.product}
                  </div>

                </div>

              </article>

            ))}

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

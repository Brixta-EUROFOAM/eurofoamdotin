import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteCommerceEndcap from "@/components/SiteCommerceEndcap";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {

  const { reviews } =
    await getStoreData();

  return (
    <>
      <Header />

      <main className="pro-reviews">

        <section className="pro-reviews-wrap">

          <header className="pro-reviews-head">

            <p>
              REAL PEOPLE. REAL SLEEP.
            </p>

            <h1>
              SLEPT ON IT.
              <br />
              THEN SPOKE.
            </h1>

            <div className="pro-review-intro">

              <p>
                Product pages tell you what a mattress
                is designed to do.
              </p>

              <strong>
                These are the people
                who actually slept on one.
              </strong>

            </div>

          </header>


          <div className="pro-review-grid">

            {reviews.map(
              (review, index) => (

                <article
                  key={review.id}
                  className="pro-review-card"
                >

                  <div className="pro-review-top">

                    <span>
                      {String(index + 1)
                        .padStart(2, "0")}
                    </span>

                    <span>
                      {"★".repeat(
                        Math.max(
                          1,
                          Math.min(
                            5,
                            review.stars
                          )
                        )
                      )}
                    </span>

                  </div>


                  <blockquote>
                    “{review.quote}”
                  </blockquote>


                  <footer>

                    <strong>
                      {review.name}
                    </strong>

                    <span>
                      {review.product}
                    </span>

                  </footer>

                </article>

              )
            )}

          </div>


          <div className="pro-reviews-end">

            <span>
              SOYE. PHIR BOLE.
            </span>

            <p>
              No scripted testimonials.
              Just customer feedback.
            </p>

          </div>

        </section>

        <SiteCommerceEndcap
          eyebrow="DONE READING PEOPLE?"
          title="GO MEET THE GADDAS."
        />

      </main>

      <Footer />
    </>
  );
}

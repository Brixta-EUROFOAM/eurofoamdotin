import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductBuyBox from "@/components/ProductBuyBox";

import {
  money,
  type Mattress,
} from "@/lib/catalog";

import {
  getProduct,
  getStoreData,
} from "@/lib/store";


export const dynamic =
  "force-dynamic";


function productMessage(
  category: string
) {

  const value =
    category.toLowerCase();

  if (value.includes("ortho")) {
    return {
      eyebrow:
        "STEADY EVERYDAY SUPPORT",
      headline:
        "Support where you need it. Comfort where you feel it.",
      body:
        "Built for sleepers who want a stable, medium-firm mattress without the board-like feel."
    };
  }

  if (value.includes("cool")) {
    return {
      eyebrow:
        "BUILT FOR WARMER NIGHTS",
      headline:
        "Less heat build-up. More comfortable sleep.",
      body:
        "A breathable mattress for sleepers who want a cooler-feeling surface without sacrificing support."
    };
  }

  if (value.includes("hybrid")) {
    return {
      eyebrow:
        "RESPONSIVE HYBRID COMFORT",
      headline:
        "More movement. Less stuck-in-foam feeling.",
      body:
        "Responsive foam and independent springs create a more buoyant feel while reducing partner disturbance."
    };
  }

  return {
    eyebrow:
      "SIMPLE EVERYDAY COMFORT",
    headline:
      "Straightforward comfort. Proper support.",
    body:
      "A practical mattress built around the essentials without unnecessary complexity."
  };
}


function practicalBenefits(
  mattress: Mattress
) {

  const value =
    mattress.category
      .toLowerCase();


  if (value.includes("cool")) {

    return [
      {
        title:
          "SLEEPS COOLER",
        body:
          "Ventilation and faster heat release where the body meets the mattress.",
      },
      {
        title:
          "MEDIUM-FIRM",
        body:
          mattress.firmness,
      },
      {
        title:
          "LOWER MOTION",
        body:
          "Built to reduce how much movement travels across the bed.",
      },
      {
        title:
          "BREATHABLE",
        body:
          "Airflow is part of the build, not a name pasted onto it.",
      },
    ];
  }


  if (value.includes("hybrid")) {

    return [
      {
        title:
          "EASIER MOVEMENT",
        body:
          "Pocket springs and responsive foam make turning feel less stuck.",
      },
      {
        title:
          "PARTNER-FRIENDLIER",
        body:
          "Independent spring movement helps reduce disturbance.",
      },
      {
        title:
          "SUPPORTED EDGES",
        body:
          "Reinforced perimeter support gives the mattress more usable surface.",
      },
      {
        title:
          "BALANCED FEEL",
        body:
          mattress.firmness,
      },
    ];
  }


  if (value.includes("essential")) {

    return [
      {
        title:
          "STRAIGHTFORWARD",
        body:
          "A simple build with the essentials explained plainly.",
      },
      {
        title:
          "SUPPORTIVE BASE",
        body:
          "Dense support underneath everyday surface comfort.",
      },
      {
        title:
          "PRACTICAL",
        body:
          "Made for guest rooms, rentals, first homes and uncomplicated sleep.",
      },
      {
        title:
          "MEDIUM-FIRM",
        body:
          mattress.firmness,
      },
    ];
  }


  return [
    {
      title:
        "STEADIER SUPPORT",
      body:
        "Structured support without turning the bed into a board.",
    },
    {
      title:
        "PRESSURE RELIEF",
      body:
        "Comfort foam gives where your body needs it to.",
    },
    {
      title:
        "LESS DISTURBANCE",
      body:
        "Built to limit how much movement travels across the mattress.",
    },
    {
      title:
        "BREATHABLE TOP",
      body:
        "A knitted surface that does not make airflow an afterthought.",
    },
  ];
}


export default async function MattressPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {

  const { slug } =
    await params;

  const mattress =
    await getProduct(slug);

  if (!mattress) {
    notFound();
  }


  const {
    products,
    reviews,
  } =
    await getStoreData();


  const related =
    products
      .filter(
        (item) =>
          item.slug !==
          mattress.slug
      )
      .slice(0, 3);


  const productReviews =
    reviews
      .filter(
        (review) =>
          review.product ===
            mattress.name ||
          review.product ===
            mattress.slug
      )
      .slice(0, 3);


  const message =
    productMessage(
      mattress.category
    );


  const benefits =
    practicalBenefits(
      mattress
    );


  return (
    <>
      <Header />


      <main className="sell-pdp">

        <section className="sell-pdp-hero">

          <div className="sell-pdp-media">

            <img
              src={mattress.image}
              alt={mattress.name}
            />

            <div className="sell-pdp-media-copy">

              <span>
                {mattress.badge ||
                  mattress.category}
              </span>

              <p>
                {message.eyebrow}
              </p>

              <strong>
                {message.headline}
              </strong>

            </div>

          </div>


          <div className="sell-pdp-console">

            <div className="sell-pdp-breadcrumb">
              <Link href="/mattresses">
                GADDAS
              </Link>

              <span>/</span>

              <span>
                {mattress.name}
              </span>
            </div>


            <ProductBuyBox
              mattress={mattress}
            />

          </div>

        </section>


        <section className="sell-pdp-benefits">

          <div className="sell-pdp-benefits-head">

            <p>
              BEFORE THE DETAILS
            </p>

            <h2>
              WHAT YOU&apos;LL
              <br />
              ACTUALLY NOTICE.
            </h2>

          </div>


          <div className="sell-pdp-benefit-grid">

            {benefits.map(
              (benefit, index) => (

                <article
                  key={benefit.title}
                >

                  <span>
                    {String(index + 1)
                      .padStart(2, "0")}
                  </span>

                  <strong>
                    {benefit.title}
                  </strong>

                  <p>
                    {benefit.body}
                  </p>

                </article>

              )
            )}

          </div>

        </section>


        <section className="sell-pdp-lifestyle">

          <img
            src={mattress.image}
            alt=""
          />

          <div className="sell-pdp-lifestyle-shade" />


          <div className="sell-pdp-lifestyle-copy">

            <p>
              THIS IS THE PART
              YOU ACTUALLY BUY.
            </p>

            <h2>
              A BED YOU
              <br />
              WANT TO
              <br />
              GET INTO.
            </h2>

            <div className="sell-pdp-lifestyle-points">

              {benefits
                .slice(0, 3)
                .map(
                  (benefit) => (

                    <span
                      key={benefit.title}
                    >
                      {benefit.title}
                    </span>

                  )
                )}

            </div>


            <Link
              href="#buy-console"
              className="sell-pdp-lifestyle-cta"
            >
              CHOOSE SIZE & BUY{" "}
              {mattress.name.toUpperCase()} ↑
            </Link>

          </div>

        </section>


        <section className="sell-pdp-construction">

          <div className="sell-pdp-section-copy">

            <p>
              NO BLACK BOX.
            </p>

            <h2>
              WHAT&apos;S INSIDE.
              <br />
              WHY IT&apos;S THERE.
            </h2>

            <span>
              If a layer matters enough
              to charge you for, it matters
              enough to explain.
            </span>

          </div>


          <div className="sell-pdp-layer-list">

            {mattress.layers.map(
              (layer, index) => (

                <article
                  key={
                    `${layer.name}-${index}`
                  }
                  className="sell-pdp-layer"
                >

                  <span>
                    {String(index + 1)
                      .padStart(2, "0")}
                  </span>


                  {layer.visualAsset ? (

                    <div className="sell-pdp-layer-image">

                      <img
                        src={
                          layer.visualAsset
                        }
                        alt=""
                      />

                    </div>

                  ) : null}


                  <div>

                    <small>
                      LAYER {index + 1}
                    </small>

                    <h3>
                      {layer.name}
                    </h3>

                    <p>
                      {layer.description}
                    </p>

                  </div>

                </article>

              )
            )}

          </div>

        </section>


        <section className="sell-pdp-mid-buy">

          <div>

            <p>
              SEEN ENOUGH?
            </p>

            <h2>
              PICK THE SIZE.
              <br />
              GET SOME SLEEP.
            </h2>

          </div>


          <div>

            <strong>
              From{" "}
              {money(
                mattress.basePrice
              )}
            </strong>

            <Link href="#buy-console">
              BUY {mattress.name.toUpperCase()} ↑
            </Link>

          </div>

        </section>


        <section className="sell-pdp-confidence">

          <div>
            <small>
              TRY IT AT HOME
            </small>

            <strong>
              {mattress.trial}
            </strong>

            <p>
              Your bedroom is a more useful
              test environment than ten minutes
              under showroom lights.
            </p>
          </div>


          <div>
            <small>
              PRODUCT COVERAGE
            </small>

            <strong>
              {mattress.warranty}
            </strong>

            <p>
              Coverage is shown before you buy,
              not buried after checkout.
            </p>
          </div>


          <div>
            <small>
              FEEL REFERENCE
            </small>

            <strong>
              {mattress.firmness}
            </strong>

            <p>
              A practical reference point,
              not fake scientific precision.
            </p>
          </div>


          <div>
            <small>
              DELIVERY
            </small>

            <strong>
              Standard shipping included
            </strong>

            <p>
              The selected price is the useful
              number. No delivery surprise later.
            </p>
          </div>

        </section>


        {productReviews.length ? (

          <section className="sell-pdp-reviews">

            <div className="sell-pdp-section-copy">

              <p>
                REAL PEOPLE.
                REAL BEDS.
              </p>

              <h2>
                THEY SLEPT
                <br />
                ON THIS ONE.
              </h2>

            </div>


            <div className="sell-pdp-review-grid">

              {productReviews.map(
                (review) => (

                  <article
                    key={review.id}
                  >

                    <div>
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

          </section>

        ) : null}


        <section className="sell-pdp-faq">

          <div className="sell-pdp-section-copy">

            <p>
              BEFORE YOU ASK.
            </p>

            <h2>
              THE USEFUL
              <br />
              QUESTIONS.
            </h2>

          </div>


          <div className="sell-pdp-faq-list">

            <details>

              <summary>
                What does this mattress
                feel like?
                <span>+</span>
              </summary>

              <p>
                The current feel reference
                is{" "}
                <strong>
                  {mattress.firmness}
                </strong>.
                Treat that as a direction,
                not a medical measurement.
              </p>

            </details>


            <details>

              <summary>
                Can I try it at home?
                <span>+</span>
              </summary>

              <p>
                This model currently lists{" "}
                <strong>
                  {mattress.trial}
                </strong>.
                Check the applicable trial
                and return terms before purchase.
              </p>

            </details>


            <details>

              <summary>
                What is the warranty?
                <span>+</span>
              </summary>

              <p>
                This model currently lists{" "}
                <strong>
                  {mattress.warranty}
                </strong>.
              </p>

            </details>


            <details>

              <summary>
                What exactly am I
                sleeping on?
                <span>+</span>
              </summary>

              <p>
                {mattress.layers.length}
                {" "}explained layers.
                Scroll up to see what each
                one is there to do.
              </p>

            </details>

          </div>

        </section>


        <section className="sell-pdp-final">

          <div>

            <p>
              YOU KNOW WHAT IT IS NOW.
            </p>

            <h2>
              STOP
              <br />
              RESEARCHING.
            </h2>

          </div>


          <div>

            <strong>
              {mattress.name}
            </strong>

            <span>
              From{" "}
              {money(
                mattress.basePrice
              )}
            </span>

            <Link href="#buy-console">
              CHOOSE SIZE & BUY ↑
            </Link>

          </div>

        </section>


        {related.length ? (

          <section className="sell-pdp-related">

            <div className="sell-pdp-related-head">

              <div>

                <p>
                  NOT THIS ONE?
                </p>

                <h2>
                  DIFFERENT JOB.
                  <br />
                  DIFFERENT GADDA.
                </h2>

              </div>


              <Link href="/compare">
                COMPARE ALL →
              </Link>

            </div>


            <div className="sell-pdp-related-grid">

              {related.map(
                (item) => (

                  <Link
                    key={item.slug}
                    href={
                      `/mattresses/${item.slug}`
                    }
                    className="sell-pdp-related-card"
                  >

                    <img
                      src={item.image}
                      alt={item.name}
                    />

                    <div>

                      <small>
                        {item.category}
                      </small>

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        {item.shortDescription}
                      </p>

                      <footer>

                        <strong>
                          From{" "}
                          {money(
                            item.basePrice
                          )}
                        </strong>

                        <span>
                          VIEW →
                        </span>

                      </footer>

                    </div>

                  </Link>

                )
              )}

            </div>

          </section>

        ) : null}


        <div className="sell-pdp-mobile-bar">

          <div>

            <small>
              {mattress.name}
            </small>

            <strong>
              From{" "}
              {money(
                mattress.basePrice
              )}
            </strong>

          </div>

          <Link href="#buy-console">
            CHOOSE SIZE →
          </Link>

        </div>

      </main>


      <Footer />
    </>
  );
}

"use client";

import Link from "next/link";
import ExplodedLayers from "@/components/home/ExplodedLayers";

import type {
  Mattress,
  Review,
  SiteSettings,
} from "@/lib/catalog";


function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}


function productJob(product: Mattress) {
  const category = product.category.toLowerCase();

  if (category.includes("ortho")) {
    return "FOR STEADY, EVERYDAY SUPPORT";
  }

  if (category.includes("cool")) {
    return "FOR PEOPLE WHO SLEEP WARM";
  }

  if (category.includes("hybrid")) {
    return "FOR BOUNCE + EASIER MOVEMENT";
  }

  if (category.includes("essential")) {
    return "FOR SIMPLE, PRACTICAL SLEEP";
  }

  return product.kicker.toUpperCase();
}


export default function SocialInspiredHome({
  site,
  products,
  reviews = [],
}: {
  site: SiteSettings;
  products: Mattress[];
  reviews?: Review[];
}) {

  const heroImage =
    site.heroSlides?.find(
      (slide) => slide.enabled !== false
    )?.image ||
    site.heroImage ||
    products[0]?.image;

  const collection = products.slice(0, 4);

  return (
    <main className="gs-home">

      {/* =====================================================
          ACT 1
          BRAND WORLDVIEW
          We are NOT selling yet.
      ====================================================== */}

      <section className="gs-hero">

        <div className="gs-hero-copy">

          <p className="gs-overline">
            GADDA / GOOD SLEEP. NO DRAMA.
          </p>

          <h1>
            SOMEHOW,
            <br />
            BUYING A
            <br />
            <span>MATTRESS</span>
            <br />
            BECAME
            <br />
            HOMEWORK.
          </h1>

          <p className="gs-hero-body">
            Fifteen layers. Fancy foam names.
            “Orthopaedic” everything.
            <br /><br />
            We think most people are asking a much simpler question:
            <strong> will I sleep well on this?</strong>
          </p>

          <a href="#problem" className="gs-story-cta">
            SEE WHAT WE MEAN
            <span>↓</span>
          </a>

          <div className="gs-hero-trust">
            <div>
              <strong>TRY AT HOME</strong>
              <span>No showroom pressure.</span>
            </div>

            <div>
              <strong>CLEAR CONSTRUCTION</strong>
              <span>Know what you sleep on.</span>
            </div>

            <div>
              <strong>DIRECT PRICING</strong>
              <span>No mystery maths.</span>
            </div>
          </div>

        </div>


        <div className="gs-hero-visual">

          {heroImage ? (
            <img
              src={heroImage}
              alt="GADDA mattress"
            />
          ) : null}

          <div className="gs-hero-shade" />

          <div className="gs-note gs-note-a">
            SAME GADDA.
            <br />
            LESS GYAAN.
          </div>

          <div className="gs-note gs-note-b">
            GOOD SLEEP
            <br />
            SHOULD NOT
            <br />
            NEED A DEGREE.
          </div>

        </div>

      </section>



      {/* =====================================================
          ACT 2
          THE VILLAIN
      ====================================================== */}

      <section
        className="gs-problem"
        id="problem"
      >

        <div className="gs-problem-copy">

          <p className="gs-orange-label">
            THE PROBLEM
          </p>

          <h2>
            MORE
            <br />
            JARGON.
            <br />
            SAME
            <br />
            SLEEP.
          </h2>

          <p>
            Somewhere along the way, mattress brands started competing
            on how complicated they could sound.
          </p>

          <p>
            More names. More diagrams. More “technology”.
            Not necessarily a better night.
          </p>

        </div>


        <div className="gs-problem-visual">

          <div className="gs-jargon-stack">
            <span>AI SLEEP TECH</span>
            <span>15 LAYERS</span>
            <span>ORTHO SUPPORT SYSTEM</span>
            <span>COOLING GEL MATRIX</span>
            <span>SPINAL ALIGNMENT ZONE</span>
            <span>PREMIUM NASA FOAM</span>
            <span>MAX PRO ULTRA+</span>
          </div>


          <div className="gs-clean-answer">
            <small>
              WHAT YOU ACTUALLY NEED
            </small>

            <strong>
              FEELS GOOD.
              <br />
              SUPPORTS YOU.
              <br />
              DOESN&apos;T COOK YOU.
              <br />
              DOESN&apos;T SHAKE THE BED.
            </strong>
          </div>


          <div className="gs-arrow-note">
            THIS.
            <br />
            NOT ALL
            <br />
            THAT.
          </div>

        </div>

      </section>



      {/* =====================================================
          ACT 3
          THE GADDA THESIS
      ====================================================== */}

      <section className="gs-belief">

        <div className="gs-belief-head">

          <p className="gs-dark-label">
            SO WE STARTED SOMEWHERE ELSE
          </p>

          <h2>
            BUILD THE
            <br />
            MATTRESS.
            <br />
            EXPLAIN IT
            <br />
            LIKE A HUMAN.
          </h2>

        </div>


        <div className="gs-belief-copy">

          <p>
            GADDA is built around a boring idea:
            a mattress should be easy to understand.
          </p>

          <p>
            Tell people how it feels.
            Tell them what it&apos;s made of.
            Tell them what each part is doing.
            Tell them what it costs.
          </p>

          <div className="gs-belief-big">
            THAT&apos;S IT.
          </div>

        </div>

      </section>



      {/* =====================================================
          ACT 4
          THE CLAIM NEEDS PROOF
      ====================================================== */}

      <section className="gs-proof-intro">

        <div>
          <p className="gs-orange-label">
            BUT HOLD ON.
          </p>

          <h2>
            “NO MYSTERY”
            <br />
            IS EASY
            <br />
            TO SAY.
          </h2>
        </div>


        <div>
          <p className="gs-proof-small">
            SO LET&apos;S PROVE IT.
          </p>

          <h3>
            What exactly are you sleeping on?
          </h3>

          <p>
            If a layer is important enough to charge you for,
            it should be important enough to explain.
          </p>

          <div className="gs-scroll-note">
            NO BLACK BOX.
            <br />
            PULL IT APART ↓
          </div>
        </div>

      </section>



      {/* =====================================================
          EXISTING QUIRK / ANIMATION
          This is now the ANSWER to the previous section.
      ====================================================== */}

      <ExplodedLayers />



      {/* =====================================================
          ACT 5
          NOW THE RANGE MAKES SENSE
      ====================================================== */}

      <section className="gs-products">

        <div className="gs-product-story">

          <div>
            <p className="gs-orange-label">
              NOW WE CAN TALK GADDAS
            </p>

            <h2>
              DIFFERENT
              <br />
              PEOPLE.
              <br />
              DIFFERENT
              <br />
              JOBS.
            </h2>
          </div>


          <div>
            <h3>
              Don&apos;t choose the fanciest mattress.
            </h3>

            <p>
              Choose the one built around what you actually care about
              when you sleep.
            </p>
          </div>

        </div>


        <div className="gs-product-grid">

          {collection.map((product, index) => (

            <Link
              href={`/mattresses/${product.slug}`}
              key={product.slug}
              className="gs-product-card"
            >

              <div className="gs-product-count">
                {String(index + 1).padStart(2, "0")}
              </div>


              <div className="gs-product-image">

                <img
                  src={product.image}
                  alt={product.name}
                />

                {product.badge ? (
                  <span>
                    {product.badge}
                  </span>
                ) : null}

              </div>


              <div className="gs-product-copy">

                <p className="gs-product-job">
                  {productJob(product)}
                </p>

                <h3>
                  {product.name}
                </h3>

                <p>
                  {product.shortDescription}
                </p>


                <div className="gs-product-points">

                  <span>
                    {product.firmness}
                  </span>

                  <span>
                    {product.layers.length} layers
                  </span>

                </div>


                <div className="gs-product-price">

                  <strong>
                    From {money(product.basePrice)}
                  </strong>

                  <b>
                    VIEW GADDA →
                  </b>

                </div>

              </div>

            </Link>

          ))}

        </div>


        <div className="gs-product-end">

          <p>
            Still torn between two?
          </p>

          <Link href="/compare">
            COMPARE THEM →
          </Link>

        </div>

      </section>



      {/* =====================================================
          ACT 6
          DON'T TRUST THE BRAND
      ====================================================== */}

      {reviews.length ? (

        <section className="gs-reviews">

          <div className="gs-reviews-head">

            <p className="gs-orange-label">
              AND NO,
              DON&apos;T JUST TAKE OUR WORD FOR IT.
            </p>

            <h2>
              REAL
              <br />
              PEOPLE.
              <br />
              REAL
              <br />
              BEDS.
            </h2>

          </div>


          <div className="gs-review-side">

            <p className="gs-proof-small">
              PEOPLE WHO ACTUALLY SLEEP ON THEM
            </p>


            <div className="gs-review-grid">

              {reviews.slice(0, 3).map((review) => (

                <article
                  key={review.id}
                  className="gs-review"
                >

                  <div className="gs-stars">
                    {"★".repeat(
                      Math.min(
                        5,
                        review.stars
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

              ))}

            </div>


            <Link
              href="/reviews"
              className="gs-review-link"
            >
              READ ALL REVIEWS →
            </Link>

          </div>

        </section>

      ) : null}



      {/* =====================================================
          ACT 7
          NOW — AND ONLY NOW — ASK THEM TO BUY
      ====================================================== */}

      <section className="gs-final">

        {heroImage ? (
          <img
            src={heroImage}
            alt=""
          />
        ) : null}

        <div className="gs-final-shade" />


        <div className="gs-final-copy">

          <p className="gs-orange-label">
            YOU KNOW ENOUGH NOW.
          </p>

          <h2>
            STOP
            <br />
            RESEARCHING
            <br />
            MATTRESSES.
          </h2>

          <p>
            Pick the job you need done.
            We&apos;ll show you the Gadda.
          </p>


          <div className="gs-final-actions">

            <Link
              href="/mattresses"
              className="gs-buy"
            >
              FIND YOUR GADDA
              <span>→</span>
            </Link>

            <Link
              href="/sleep-quiz"
              className="gs-help"
            >
              I STILL NEED HELP →
            </Link>

          </div>

        </div>


        <div className="gs-final-note">
          GOOD SLEEP.
          <br />
          NO DRAMA.
        </div>

      </section>

    </main>
  );
}

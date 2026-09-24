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


function productSavingPercent(product: Mattress) {
  if (
    !product.compareAt ||
    product.compareAt <= product.basePrice
  ) {
    return 0;
  }

  return Math.round(
    ((product.compareAt - product.basePrice) /
      product.compareAt) *
      100
  );
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

          <div className="gs-hero-actions">

            <Link
              href="/mattresses"
              className="gs-commerce-primary"
            >
              SHOP GADDAS
              <span>→</span>
            </Link>

            <Link
              href="/sleep-quiz"
              className="gs-commerce-secondary"
            >
              FIND MY MATCH
              <span>→</span>
            </Link>

            <a
              href="#problem"
              className="gs-story-link"
            >
              OR SEE WHY ↓
            </a>

          </div>

          <div className="gs-hero-trust">
            <div>
              <strong>TRY AT HOME</strong>
              <span>Trial terms shown on every Gadda.</span>
            </div>

            <div>
              <strong>DELIVERY INCLUDED</strong>
              <span>Standard shipping included.</span>
            </div>

            <div>
              <strong>WARRANTY INCLUDED</strong>
              <span>Coverage shown clearly by model.</span>
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
          EXISTING QUIRK / ANIMATION
          This is now the ANSWER to the previous section.
      ====================================================== */}

      <ExplodedLayers products={products} />



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

                <div className="gs-product-socialproof">
                  <span>
                    ★ {product.rating}
                  </span>

                  <span>
                    {product.reviews.toLocaleString("en-IN")} reviews
                  </span>
                </div>


                <div className="gs-product-points">

                  <span>
                    {product.firmness}
                  </span>

                  <span>
                    {product.layers.length} layers
                  </span>

                </div>


                <div className="gs-product-price">

                  <div className="gs-product-price-stack">

                    <small>
                      FROM
                    </small>

                    <strong>
                      {money(product.basePrice)}
                    </strong>

                    {product.compareAt >
                    product.basePrice ? (
                      <div className="gs-product-saving">
                        <del>
                          {money(product.compareAt)}
                        </del>

                        <span>
                          SAVE {productSavingPercent(product)}%
                        </span>
                      </div>
                    ) : null}

                  </div>

                  <b>
                    VIEW + CHOOSE SIZE →
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

          <div className="gs-product-end-actions">
            <Link href="/compare">
              COMPARE THEM →
            </Link>

            <Link href="/sleep-quiz">
              LET GADDA PICK →
            </Link>
          </div>

        </div>


        <div className="gs-buy-confidence-strip">

          <div>
            <span>01</span>
            <strong>TRY IT AT HOME</strong>
            <p>Trial terms are visible before you buy.</p>
          </div>

          <div>
            <span>02</span>
            <strong>DELIVERY INCLUDED</strong>
            <p>Standard shipping is included in the selected price.</p>
          </div>

          <div>
            <span>03</span>
            <strong>WARRANTY, IN WRITING</strong>
            <p>Coverage is shown clearly for every model.</p>
          </div>

          <div>
            <span>04</span>
            <strong>NO BLACK BOX</strong>
            <p>Feel, layers, price and purpose are explained.</p>
          </div>

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
          ACT 6.5
          REMOVE THE LAST BUYING FRICTION
      ====================================================== */}

      <section className="gs-home-faq">

        <div className="gs-home-faq-head">
          <p className="gs-orange-label">
            BEFORE YOU ASK.
          </p>

          <h2>
            THE USEFUL
            <br />
            QUESTIONS.
          </h2>

          <p>
            No encyclopaedia. Just the things that usually
            stop someone from placing the order.
          </p>
        </div>

        <div className="gs-home-faq-list">

          <details>
            <summary>
              How do I know which Gadda is for me?
              <span>+</span>
            </summary>

            <p>
              Use Find My Match if you want a guided answer,
              or compare the mattresses side by side if you
              already know what you care about.
            </p>
          </details>

          <details>
            <summary>
              Can I try it at home?
              <span>+</span>
            </summary>

            <p>
              Yes. Trial terms vary by mattress and are shown
              clearly on each product page before you buy.
            </p>
          </details>

          <details>
            <summary>
              What exactly am I paying for?
              <span>+</span>
            </summary>

            <p>
              Every product page shows the selected price,
              available sizes and heights, the layer stack,
              feel reference, trial and warranty.
            </p>
          </details>

          <details>
            <summary>
              What if I am choosing between two?
              <span>+</span>
            </summary>

            <p>
              Use Compare. The point is to pick the job you
              need done, not the mattress with the longest
              feature list.
            </p>
          </details>

        </div>

      </section>


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

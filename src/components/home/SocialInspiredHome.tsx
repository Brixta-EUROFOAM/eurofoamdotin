"use client";

import Link from "next/link";
import ExplodedLayers from "@/components/home/ExplodedLayers";

import type {
  Mattress,
  Review,
  SiteSettings,
} from "@/lib/catalog";


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

          <div className="gs-problem-stack">

            <img
              src="/home/mattress-jargon.png"
              alt="A stack of mattresses labelled with sleep-tech marketing jargon: AI sleep tech, 15 layers, ortho support system, cooling gel matrix, spinal alignment zone, premium NASA foam, max pro ultra+"
            />

            <div className="gs-note gs-problem-note-a">
              YOU DON&apos;T NEED
              <br />
              ANY OF THIS.
            </div>

          </div>


          <div className="gs-problem-single">

            <img
              src="/media/1789122018422-a-mattress-on-a-wooden-floor-in-a-bedroom-photo.jpg"
              alt="A single, honestly built Gadda mattress, made up and ready to sleep on"
            />

            <span className="gs-problem-badge">GADDA.</span>

            <div className="gs-note gs-problem-note-b">
              YOU JUST
              <br />
              NEED THIS.
            </div>

          </div>

        </div>

      </section>




      {/* =====================================================
          EXISTING QUIRK / ANIMATION
          This is now the ANSWER to the previous section.
      ====================================================== */}

      <ExplodedLayers products={products} />




      {/* =====================================================
          ACT 6
          DON'T TRUST THE BRAND
      ====================================================== */}

      <section className="gs-help">

        <div className="gs-help-faq">

          <p className="gs-orange-label">
            BEFORE YOU ASK.
          </p>

          <h2>
            THE USEFUL
            <br />
            QUESTIONS.
          </h2>

          <p className="gs-help-faq-intro">
            No encyclopaedia. Just the things that usually
            stop someone from placing the order.
          </p>

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

        </div>


        {reviews.length ? (

          <div className="gs-help-reviews">

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

            <p className="gs-proof-small">
              PEOPLE WHO ACTUALLY SLEEP ON THEM →
            </p>


            <div className="gs-help-reviews-track">

              {reviews.map((review) => (

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

        ) : null}

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
"use client";

import Link from "next/link";
import ExplodedLayers from "@/components/home/ExplodedLayers";
import HomeExtras from "@/components/home/HomeExtras";
import MobileBuyBar from "@/components/MobileBuyBar";

import { money } from "@/lib/catalog";
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
              <strong>100 NIGHTS</strong>
              <span>Sleep on it at home before you decide.</span>
            </div>

            <div>
              <strong>FREE DELIVERY</strong>
              <span>To your door. No lift charges.</span>
            </div>

            <div>
              <strong>PAY ON DELIVERY</strong>
              <span>Or by UPI link. We call to confirm first.</span>
            </div>

            <div>
              <strong>NO FAKE MRP</strong>
              <span>One honest price, every day.</span>
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

          {products.length ? (
            <div className="gs-note gs-note-price">
              FROM {money(Math.min(...products.map((p) => p.basePrice)))}
              <small>NO FAKE MRP. EVER.</small>
            </div>
          ) : null}

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

      <HomeExtras />




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
                Which Gadda should I buy?
                <span>+</span>
              </summary>
              <p>
                Most people should buy Pro. If you sleep hot or sleep on your side, Ultimate. For a guest room, a first home or a tight budget, Regular. Still stuck? Find My Match takes about a minute.
              </p>
            </details>

            <details>
              <summary>
                What&apos;s the difference between HD and HR foam?
                <span>+</span>
              </summary>
              <p>
                Both are support foams. HD (high-density) foam is firm and steady. HR (high-resilience) foam springs back faster and holds its shape longer. The number is the density: 40D is denser and more supportive than 32D.
              </p>
            </details>

            <details>
              <summary>
                Foam or pocket springs?
                <span>+</span>
              </summary>
              <p>
                Foam is quiet and solid. Pocket springs are bouncier and let more air through. Gadda Pro comes with either; springs cost a little extra.
              </p>
            </details>

            <details>
              <summary>
                Memory foam or latex?
                <span>+</span>
              </summary>
              <p>
                Memory foam slowly moulds to you and feels hugging. Latex is bouncier and breathes better. Gadda Ultimate comes with cool memory foam, or upgrade the top layer to latex.
              </p>
            </details>

            <details>
              <summary>
                How does the 100-night trial work?
                <span>+</span>
              </summary>
              <p>
                Sleep on it at home. Give it a few weeks, because every new mattress takes some getting used to. If it isn&apos;t right, tell us within the trial and we sort it out.
              </p>
            </details>

            <details>
              <summary>
                How do I pay?
                <span>+</span>
              </summary>
              <p>
                Place your order online, and we call to confirm your address and delivery day. Pay on delivery, or ask for a UPI link and pay before it ships. Nothing is charged on the website.
              </p>
            </details>

            <details>
              <summary>
                How long does delivery take?
                <span>+</span>
              </summary>
              <p>
                We confirm your delivery date on the call after you order. Delivery is free, to your door.
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

        ) : (
          <div className="gs-help-reviews gp-noreviews">
            <p className="gs-orange-label">
              AND THE REVIEWS?
            </p>
            <h2>
              ABHI
              <br />
              NAHI.
            </h2>
            <p className="gp-noreviews-copy">
              We&apos;re new. We could have written a hundred five-star reviews ourselves. Plenty of
              brands do. We&apos;d rather wait for yours.
            </p>
            <p className="gp-noreviews-small">
              Sleep on it for 100 nights, then tell everyone the truth. Good or bad, it goes up here.
            </p>
          </div>
        )}

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
              className="gs-commerce-secondary"
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

      <MobileBuyBar product={products.find((p) => p.slug === "gadda-pro") || products[1] || products[0]} />
    </main>
  );
}
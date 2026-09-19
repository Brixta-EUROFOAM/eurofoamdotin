import Link from "next/link";

import CampaignHero from "@/components/home/CampaignHero";
import ExplodedLayers from "@/components/home/ExplodedLayers";

import type {
  Mattress,
  SiteSettings,
} from "@/lib/catalog";

function money(value: number) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

function numberFromText(value?: string) {
  if (!value) return 0;

  const found =
    value.match(/\d+/);

  return found
    ? Number(found[0])
    : 0;
}

function friendlyName(product: Mattress) {

  const category =
    product.category
      ?.toLowerCase() || "";

  if (category.includes("cool")) {
    return "COOL WALA";
  }

  if (
    category.includes("ortho") ||
    category.includes("support")
  ) {
    return "SUPPORT WALA";
  }

  if (
    category.includes("hybrid") ||
    category.includes("spring")
  ) {
    return "BOUNCY WALA";
  }

  if (
    category.includes("essential") ||
    category.includes("basic")
  ) {
    return "SIMPLE WALA";
  }

  return "GADDA";
}

export default function SocialInspiredHome({
  site,
  products,
}: {
  site: SiteSettings;
  products: Mattress[];
}) {

  const range =
    products.slice(0, 4);

  const maxTrial =
    Math.max(
      0,
      ...products.map(
        (product) =>
          numberFromText(product.trial)
      )
    );

  const maxWarranty =
    Math.max(
      0,
      ...products.map(
        (product) =>
          numberFromText(product.warranty)
      )
    );

  const credibilityImage =
    site.heroSlides?.[1]?.image
    || products[0]?.image
    || site.heroImage;

  return (
    <main className="gadda-v3-home">

      {/* =========================================
          00 / HERO
      ========================================== */}

      <CampaignHero
        site={site}
        products={products}
      />


      {/* =========================================
          01 / STORY
      ========================================== */}

      <section
        id="story"
        className="gadda-v3-story"
      >

        <div className="gadda-v3-story-copy">

          <p className="gadda-v3-label">
            01 / OUR STORY
          </p>

          <h2>
            TIRED OF
            <br />
            OVERPRICED
            <br />
            MATTRESSES?
          </h2>

          <strong>
            SO WERE WE.
          </strong>

          <p>
            Somewhere along the way, buying a mattress
            became a maze of fancy names, endless models
            and showroom gyaan.
          </p>

          <p>
            GADDA strips it back: a few clear choices,
            transparent construction and prices you can
            actually compare.
          </p>

          <p className="gadda-v3-story-last">
            Same gadda.
            <br />
            Less drama.
          </p>

        </div>


        <div className="gadda-v3-story-art">

          <div className="gadda-v3-doodle-card">

            <span className="gadda-v3-doodle-top">
              NO FANCY
              <br />
              MARKETING
              <br />
              GIMMICKS.
            </span>

            <div className="gadda-v3-bed-doodle">
              <div className="gadda-v3-doodle-head" />
              <div className="gadda-v3-doodle-body" />
              <div className="gadda-v3-doodle-mattress">
                GADDA.
              </div>
            </div>

            <span className="gadda-v3-doodle-right">
              JUST
              <br />
              GOOD SLEEP.
            </span>

          </div>


          <div className="gadda-v3-story-callout">
            A SIMPLE PRODUCT.
            <br />
            KEPT SIMPLE.
          </div>

        </div>

      </section>



      {/* =========================================
          02 / CREDIBILITY
      ========================================== */}

      <section className="gadda-v3-cred">

        <div className="gadda-v3-cred-copy">

          <p className="gadda-v3-label">
            02 / REAL CREDIBILITY
          </p>

          <h2>
            LET THE
            <br />
            PRODUCT
            <br />
            DO THE TALKING.
          </h2>

          <p>
            Clear materials. Clear warranties.
            Clear trials. Layer-by-layer construction
            you can actually inspect.
          </p>


          <div className="gadda-v3-stats">

            <div>
              <strong>
                {products.length}
              </strong>

              <span>
                CLEAR
                <br />
                MODELS
              </span>
            </div>


            <div>
              <strong>
                {maxTrial || "—"}
              </strong>

              <span>
                NIGHT TRIAL
                <br />
                UP TO
              </span>
            </div>


            <div>
              <strong>
                {maxWarranty || "—"}
              </strong>

              <span>
                YEAR WARRANTY
                <br />
                UP TO
              </span>
            </div>


            <div>
              <strong>
                100%
              </strong>

              <span>
                CONSTRUCTION
                <br />
                VISIBLE
              </span>
            </div>

          </div>

        </div>


        <div className="gadda-v3-cred-photo">

          {credibilityImage ? (
            <img
              src={credibilityImage}
              alt="GADDA product"
            />
          ) : null}

          <div>
            REAL PRODUCT.
            <br />
            REAL SPECS.
            <br />
            NO MYSTERY.
          </div>

        </div>

      </section>



      {/* =========================================
          03 / RANGE
      ========================================== */}

      <section
        id="collection"
        className="gadda-v3-range"
      >

        <div className="gadda-v3-range-head">

          <div>

            <p className="gadda-v3-label">
              03 / THE GADDA RANGE
            </p>

            <h2>
              SIMPLE CHOICES.
              <br />
              SERIOUS COMFORT.
            </h2>

          </div>


          <p>
            No 50 confusing variants.
            <br />
            No mattress taxonomy exam.
            <br />
            Just pick what you need.
          </p>

        </div>


        <div className="gadda-v3-range-grid">

          {range.map(
            (product, index) => (

              <article
                key={product.slug}
                className="gadda-v3-product"
              >

                <Link
                  href={`/mattresses/${product.slug}`}
                  className="gadda-v3-product-image"
                >

                  <img
                    src={product.image}
                    alt={product.name}
                  />

                  <span>
                    0{index + 1}
                  </span>

                </Link>


                <div className="gadda-v3-product-copy">

                  <p>
                    {friendlyName(product)}
                  </p>

                  <h3>
                    {product.name}
                  </h3>

                  <span className="gadda-v3-product-kicker">
                    {product.kicker}
                  </span>


                  <div className="gadda-v3-product-spec">

                    <span>
                      {product.firmness}
                    </span>

                  </div>


                  <div className="gadda-v3-product-bottom">

                    <div>

                      <small>
                        FROM
                      </small>

                      <strong>
                        {money(product.basePrice)}
                      </strong>

                    </div>


                    <Link
                      href={`/mattresses/${product.slug}`}
                    >
                      VIEW ↗
                    </Link>

                  </div>

                </div>

              </article>

            )
          )}

        </div>


        <Link
          href="/mattresses"
          className="gadda-v3-range-all"
        >
          SEE ALL MATTRESSES ↗
        </Link>

      </section>



      {/* =========================================
          04 / NO BLACK BOX
          KEEP THE GOOD INTERACTION
      ========================================== */}

      <ExplodedLayers />



      {/* =========================================
          05 / SHORT SOCIAL PROOF / NEXT STEP
      ========================================== */}

      <section className="gadda-v3-after">

        <div>

          <p className="gadda-v3-label">
            05 / STILL THINKING?
          </p>

          <h2>
            DON&apos;T
            <br />
            OVERTHINK
            <br />
            THE GADDA.
          </h2>

        </div>


        <div className="gadda-v3-after-actions">

          <p>
            Read what sleepers say,
            compare the four, or answer a few
            questions and we&apos;ll point you
            in the right direction.
          </p>

          <Link href="/reviews">
            REAL REVIEWS ↗
          </Link>

          <Link href="/compare">
            COMPARE GADDE ↗
          </Link>

          <Link href="/sleep-quiz">
            HELP ME PICK ↗
          </Link>

        </div>

      </section>



      {/* =========================================
          FINAL
      ========================================== */}

      <section className="gadda-v3-final">

        <div>

          <p>
            SAME GADDA.
            <br />
            LESS DRAMA.
          </p>

          <h2>
            GADDA
            <br />
            HI HAI
            <br />
            YAAR.
          </h2>

        </div>


        <Link href="/mattresses">
          SHOP NOW ↗
        </Link>

      </section>

    </main>
  );
}

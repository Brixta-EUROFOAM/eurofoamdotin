import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductBuyBox from "@/components/ProductBuyBox";

import { money } from "@/lib/catalog";
import { getProduct, getStoreData } from "@/lib/store";


export const dynamic = "force-dynamic";


function productMessage(category: string) {

  const value =
    category.toLowerCase();

  if (value.includes("ortho")) {
    return {
      eyebrow:
        "BALANCED EVERYDAY SUPPORT",
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


export default async function MattressPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {

  const { slug } = await params;

  const mattress =
    await getProduct(slug);

  if (!mattress) {
    notFound();
  }

  const { products } =
    await getStoreData();

  const related =
    products
      .filter(
        (item) =>
          item.slug !== mattress.slug
      )
      .slice(0, 3);

  const message =
    productMessage(
      mattress.category
    );

  return (
    <>
      <Header />

      <main className="pro-pdp">

        {/* ===============================================
            PRODUCT / COMMERCE
        ================================================ */}

        <section className="pro-pdp-hero">

          <div className="pro-pdp-grid">

            <div className="pro-product-media">

              <div className="pro-product-media-head">

                <span>
                  {mattress.badge ||
                    mattress.category}
                </span>

                <span>
                  {mattress.category}
                </span>

              </div>


              <div className="pro-product-image">

                <img
                  src={mattress.image}
                  alt={mattress.name}
                />

              </div>


              <div className="pro-product-caption">

                <small>
                  DESIGNED FOR
                </small>

                <p>
                  {message.body}
                </p>

              </div>

            </div>


            <div className="pro-product-column">

              <div className="pro-product-intro">

                <p>
                  {message.eyebrow}
                </p>

                <h2>
                  {message.headline}
                </h2>

              </div>

              <ProductBuyBox
                mattress={mattress}
              />

            </div>

          </div>

        </section>



        {/* ===============================================
            WHAT IT DOES
        ================================================ */}

        <section className="pro-benefits">

          <div className="pro-section-heading">

            <div>
              <p>
                WHAT IT&apos;S BUILT TO DO
              </p>

              <h2>
                Four things.
                <br />
                Clearly explained.
              </h2>
            </div>

            <p>
              A mattress does not need a long list of invented
              technologies. These are the practical differences
              this one is designed to make.
            </p>

          </div>


          <div className="pro-benefit-grid">

            {mattress.features.map(
              (feature, index) => (

                <article
                  key={
                    `${feature}-${index}`
                  }
                >
                  <span>
                    {String(index + 1)
                      .padStart(2, "0")}
                  </span>

                  <strong>
                    {feature}
                  </strong>
                </article>

              )
            )}

          </div>

        </section>



        {/* ===============================================
            CONSTRUCTION
        ================================================ */}

        <section className="pro-construction">

          <div className="pro-construction-intro">

            <p>
              NO BLACK BOX
            </p>

            <h2>
              What&apos;s inside,
              and why it&apos;s there.
            </h2>

            <div>
              If a layer matters enough to put in the mattress,
              it should be easy to explain what job it performs.
            </div>

          </div>


          <div className="pro-layer-list">

            {mattress.layers.map(
              (layer, index) => (

                <article
                  key={
                    `${layer.name}-${index}`
                  }
                  className="pro-layer"
                >

                  <span className="pro-layer-number">
                    {String(index + 1)
                      .padStart(2, "0")}
                  </span>


                  {layer.visualAsset ? (

                    <div className="pro-layer-image">

                      <img
                        src={layer.visualAsset}
                        alt=""
                      />

                    </div>

                  ) : null}


                  <div className="pro-layer-copy">

                    <small>
                      LAYER
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



        {/* ===============================================
            OWNERSHIP
        ================================================ */}

        <section className="pro-confidence">

          <div>
            <small>
              TRY IT WHERE YOU SLEEP
            </small>

            <strong>
              {mattress.trial}
            </strong>

            <p>
              Your bedroom is a better test environment
              than a showroom floor.
            </p>
          </div>


          <div>
            <small>
              LONG-TERM COVERAGE
            </small>

            <strong>
              {mattress.warranty}
            </strong>

            <p>
              Straightforward product coverage
              for long-term ownership.
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
              A simple reference point for how
              the mattress is designed to feel.
            </p>
          </div>

        </section>



        {/* ===============================================
            RELATED
        ================================================ */}

        {related.length ? (

          <section className="pro-related">

            <div className="pro-section-heading">

              <div>
                <p>
                  STILL COMPARING?
                </p>

                <h2>
                  Different jobs.
                  <br />
                  Same clarity.
                </h2>
              </div>

              <p>
                If this is not the feel you are looking for,
                compare the rest of the range before deciding.
              </p>

            </div>


            <div className="pro-related-grid">

              {related.map(
                (item) => (

                  <Link
                    key={item.slug}
                    href={
                      `/mattresses/${item.slug}`
                    }
                    className="pro-related-card"
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
                          From {money(item.basePrice)}
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

      </main>

      <Footer />
    </>
  );
}

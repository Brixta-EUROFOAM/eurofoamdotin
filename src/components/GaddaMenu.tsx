"use client";

import Link from "next/link";
import { useEffect } from "react";

import type {
  Mattress,
} from "@/lib/catalog";


function money(
  value: number
) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}


function attitude(
  category: string
) {

  const key =
    category.toLowerCase();

  if (
    key.includes("ortho")
  ) {
    return "KAMAR KA SCENE?";
  }

  if (
    key.includes("cool")
  ) {
    return "RAAT KO GARMI?";
  }

  if (
    key.includes("hybrid")
  ) {
    return "THODA BOUNCE?";
  }

  if (
    key.includes("essential")
  ) {
    return "BAS GADDA CHAHIYE?";
  }

  return "KAUNSA GADDA?";
}


export default function GaddaMenu({
  products,
  onClose,
}: {
  products: Mattress[];
  onClose: () => void;
}) {

  useEffect(() => {

    const previous =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";


    function escape(
      event: KeyboardEvent
    ) {

      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    }


    window.addEventListener(
      "keydown",
      escape
    );


    return () => {

      document.body.style.overflow =
        previous;

      window.removeEventListener(
        "keydown",
        escape
      );
    };

  }, [onClose]);


  return (
    <div className="gadda-menu-shell">


      <aside className="gadda-menu-sidebar">

        <div className="gadda-menu-sidebar-top">

          <button
            type="button"
            onClick={onClose}
            className="gadda-menu-close"
            aria-label="Close Gadda menu"
          >
            ×
          </button>


          <div>

            <div className="gadda-menu-side-brand">
              GADDA
            </div>

            <p className="gadda-menu-side-line">
              Gadda hi hai yaar.
            </p>

          </div>

        </div>


        <nav className="gadda-menu-nav">

          <a href="#gadda-menu-top">
            THE GADDA MENU
          </a>


          {products.map(
            (product, index) => (

              <a
                key={product.slug}
                href={
                  `#gadda-${product.slug}`
                }
              >

                <span>
                  0{index + 1}
                </span>

                {product.name}

              </a>

            )
          )}

        </nav>


        <div className="gadda-menu-side-actions">

          <Link
            href="/mattresses"
            onClick={onClose}
          >
            SHOP ALL GADDE →
          </Link>

          <Link
            href="/compare"
            onClick={onClose}
          >
            COMPARE →
          </Link>

          <Link
            href="/sleep-quiz"
            onClick={onClose}
          >
            KAUNSA WALA? →
          </Link>

        </div>

      </aside>



      <div className="gadda-menu-book">


        <section
          id="gadda-menu-top"
          className="gadda-menu-cover"
        >

          <div className="gadda-menu-cover-meta">

            <span>
              MATTRESSES / VOL. 01
            </span>

            <span>
              GADDA
            </span>

          </div>


          <div className="gadda-menu-cover-title">

            <p>
              THE
            </p>

            <h2>
              GADDA
              <br />
              MENU
            </h2>

          </div>


          <div className="gadda-menu-cover-bottom">

            <p>
              Gadda hi hai yaar.
            </p>

            <span>
              SCROLL ↓
            </span>

          </div>

        </section>



        {products.map(
          (product, index) => {

            const detailAsset =
              product.layers.find(
                (layer) =>
                  Boolean(
                    layer.visualAsset
                  )
              )?.visualAsset ||
              product.image;


            return (

              <section
                key={product.slug}
                id={
                  `gadda-${product.slug}`
                }
                className={
                  `gadda-menu-page ${
                    index % 2
                      ? "gadda-menu-page-reverse"
                      : ""
                  }`
                }
              >


                <div className="gadda-menu-page-copy">

                  <div className="gadda-menu-page-number">
                    0{index + 1}
                    {" / "}
                    0{products.length}
                  </div>


                  <p className="gadda-menu-attitude">
                    {attitude(
                      product.category
                    )}
                  </p>


                  <h3>
                    {product.name}
                  </h3>


                  <p className="gadda-menu-kicker">
                    {product.kicker}
                  </p>


                  <p className="gadda-menu-description">
                    {product.shortDescription}
                  </p>



                  <div className="gadda-menu-spec-row">

                    <div>
                      <small>FEEL</small>
                      <strong>{product.firmness}</strong>
                    </div>

                    <div>
                      <small>TRIAL</small>
                      <strong>{product.trial}</strong>
                    </div>

                    <div>
                      <small>WARRANTY</small>
                      <strong>{product.warranty}</strong>
                    </div>

                  </div>



                  <div className="gadda-menu-feature-list">

                    {product.features
                      .slice(0, 4)
                      .map(
                        (
                          feature,
                          featureIndex
                        ) => (

                          <div
                            key={feature}
                          >

                            <span>
                              0{featureIndex + 1}
                            </span>

                            <p>
                              {feature}
                            </p>

                          </div>

                        )
                      )}

                  </div>



                  <div className="gadda-menu-price">

                    <div>

                      <small>
                        STARTS AT
                      </small>

                      <strong>
                        {money(
                          product.basePrice
                        )}
                      </strong>

                    </div>


                    <Link
                      href={
                        `/mattresses/${product.slug}`
                      }
                      onClick={onClose}
                    >
                      GADDA DEKHO ↗
                    </Link>

                  </div>

                </div>



                <div className="gadda-menu-page-visual">


                  <div className="gadda-menu-image-frame">

                    <img
                      src={product.image}
                      alt={product.name}
                    />

                    <span className="gadda-menu-image-label">
                      {product.badge ||
                        product.category}
                    </span>

                  </div>



                  <div className="gadda-menu-product-study">

                    <div className="gadda-menu-product-study-image">

                      <img
                        src={detailAsset}
                        alt={`${product.name} detail`}
                      />

                    </div>


                    <div className="gadda-menu-product-study-copy">

                      <small>
                        PRODUCT DETAIL
                      </small>

                      <strong>
                        {product.layers.length}
                        {" "}
                        EXPLAINED
                        <br />
                        LAYERS.
                      </strong>

                      <p>
                        {product.layers[0]
                          ?.description ||
                          product.features[0]}
                      </p>

                      <Link
                        href={
                          `/mattresses/${product.slug}#buy-console`
                        }
                        onClick={onClose}
                      >
                        PICK SIZE & BUY →
                      </Link>

                    </div>

                  </div>

                </div>


              </section>

            );
          }
        )}



        <section className="gadda-menu-back-cover">

          <p>
            BAS.
          </p>

          <h2>
            GADDA HI
            <br />
            HAI YAAR.
          </h2>

          <div>

            <Link
              href="/mattresses"
              onClick={onClose}
            >
              SAARE GADDE →
            </Link>

            <Link
              href="/sleep-quiz"
              onClick={onClose}
            >
              KAUNSA WALA? →
            </Link>

          </div>

        </section>


      </div>

    </div>
  );
}

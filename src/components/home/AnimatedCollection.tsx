"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  Mattress,
} from "@/lib/catalog";


function clamp(value: number) {
  return Math.max(
    0,
    Math.min(1, value)
  );
}


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


export default function AnimatedCollection({
  products,
}: {
  products: Mattress[];
}) {

  const sectionRef =
    useRef<HTMLElement>(null);

  const manualUntil =
    useRef(0);

  const collection =
    products.slice(0, 4);

  const [progress, setProgress] =
    useState(0);

  const [active, setActive] =
    useState(0);


  useEffect(() => {

    let raf = 0;

    const update = () => {

      raf = 0;

      const section =
        sectionRef.current;

      if (!section) return;

      const rect =
        section.getBoundingClientRect();

      const vh =
        window.innerHeight || 1;

      const travel =
        Math.max(
          1,
          rect.height - vh
        );

      const raw =
        clamp(
          -rect.top / travel
        );

      setProgress(raw);


      if (
        Date.now() >
        manualUntil.current
      ) {

        const index =
          Math.min(
            collection.length - 1,
            Math.floor(
              clamp(
                raw * 1.02
              ) *
              collection.length
            )
          );

        setActive(index);

      }

    };


    const request = () => {

      if (!raf) {

        raf =
          requestAnimationFrame(
            update
          );

      }

    };


    update();

    window.addEventListener(
      "scroll",
      request,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      request
    );


    return () => {

      window.removeEventListener(
        "scroll",
        request
      );

      window.removeEventListener(
        "resize",
        request
      );

      if (raf) {
        cancelAnimationFrame(raf);
      }

    };

  }, [collection.length]);


  function choose(index: number) {

    manualUntil.current =
      Date.now() + 1900;

    setActive(index);

  }


  if (!collection.length) {
    return null;
  }


  const product =
    collection[active];


  /*
    Cards begin almost stacked.

    As the user scrolls through the section,
    the deck fans outward.
  */

  const fan =
    14 + progress * 72;


  return (

    <section
      ref={sectionRef}
      id="collection"
      className="gadda-collection-motion"
    >

      <div className="gadda-collection-sticky">


        {/* ==========================================
            LEFT: COLLECTION INTRO
        =========================================== */}

        <div className="gadda-collection-copy">

          <p className="gadda-collection-label">
            02 / THE COLLECTION
          </p>


          <h2>

            PICK
            <br />

            YOUR
            <br />

            KIND
            <br />

            OF REST.

          </h2>


          <p className="gadda-collection-intro">

            Each mattress has a clear job.

            <br /><br />

            Scroll through the collection.

          </p>


          <div className="gadda-collection-progress">

            <span>
              SCROLL THE DECK
            </span>

            <div>

              <i
                style={{
                  transform:
                    `scaleX(${progress})`
                }}
              />

            </div>

          </div>

        </div>



        {/* ==========================================
            CENTRE: PHYSICAL PRODUCT DECK
        =========================================== */}

        <div className="gadda-collection-stage">


          <div className="gadda-collection-stage-head">

            <span>
              GADDA / COLLECTION
            </span>

            <span>
              0{active + 1}
              {" / "}
              0{collection.length}
            </span>

          </div>


          <div className="gadda-product-deck">


            {collection.map(
              (item, index) => {

                const centre =
                  (collection.length - 1) /
                  2;

                const relative =
                  index - centre;

                const isActive =
                  active === index;

                const x =
                  relative * fan;

                const rotation =
                  relative *
                  (
                    1.3 +
                    progress * 2.7
                  );

                const y =
                  isActive
                    ? -34
                    : Math.abs(
                        index - active
                      ) * 6;

                const scale =
                  isActive
                    ? 1.055
                    : 0.94;

                return (

                  <button
                    key={item.slug}
                    type="button"

                    onClick={() =>
                      choose(index)
                    }

                    className={
                      "gadda-product-card " +
                      (
                        isActive
                          ? "is-active"
                          : ""
                      )
                    }

                    style={{
                      zIndex:
                        isActive
                          ? 50
                          : 20 - Math.abs(
                              index -
                              active
                            ),

                      transform:
                        `translate(-50%, -50%) ` +
                        `translateX(${x}px) ` +
                        `translateY(${y}px) ` +
                        `rotate(${rotation}deg) ` +
                        `scale(${scale})`,
                    }}
                  >


                    <div className="gadda-product-card-image">

                      <img
                        src={item.image}
                        alt={item.name}
                        draggable={false}
                      />

                    </div>


                    <div className="gadda-product-card-bottom">

                      <div>

                        <small>
                          0{index + 1}
                        </small>

                        <strong>
                          {item.name}
                        </strong>

                      </div>


                      <span>
                        {item.badge ||
                          item.category}
                      </span>

                    </div>


                  </button>

                );

              }
            )}


          </div>


          <div className="gadda-collection-click">

            <span>
              CLICK A GADDA
            </span>

            <strong>
              0{active + 1}
            </strong>

          </div>


        </div>



        {/* ==========================================
            RIGHT: ACTIVE PRODUCT
        =========================================== */}

        <div className="gadda-collection-info">


          <div className="gadda-collection-info-number">

            0{active + 1}

          </div>


          <div
            key={product.slug}
            className="gadda-collection-active"
          >

            <p>
              {product.badge ||
                product.category}
            </p>


            <h3>
              {product.name}
            </h3>


            <h4>
              {product.kicker}
            </h4>


            <p className="gadda-collection-description">

              {product.shortDescription}

            </p>


            <div className="gadda-collection-specs">

              <div>

                <small>
                  FEEL
                </small>

                <strong>
                  {product.firmness}
                </strong>

              </div>


              <div>

                <small>
                  TRIAL
                </small>

                <strong>
                  {product.trial}
                </strong>

              </div>


              <div>

                <small>
                  WARRANTY
                </small>

                <strong>
                  {product.warranty}
                </strong>

              </div>

            </div>


            <div className="gadda-collection-price">

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
              >

                DEKHO ↗

              </Link>

            </div>

          </div>



          <div className="gadda-collection-picker">

            {collection.map(
              (item, index) => (

                <button
                  type="button"
                  key={item.slug}

                  onClick={() =>
                    choose(index)
                  }

                  className={
                    active === index
                      ? "is-active"
                      : ""
                  }
                >

                  <span>
                    0{index + 1}
                  </span>

                  <strong>
                    {item.name}
                  </strong>

                </button>

              )
            )}

          </div>


        </div>


      </div>

    </section>

  );

}

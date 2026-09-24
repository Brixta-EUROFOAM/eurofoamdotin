"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SavedMattress } from "@/components/WishlistButton";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function WishlistClient() {

  const [items, setItems] = useState<SavedMattress[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setItems(
        JSON.parse(
          localStorage.getItem("eurofoam-wishlist") || "[]"
        )
      );
    } finally {
      setReady(true);
    }
  }, []);


  function remove(slug: string) {

    const next =
      items.filter(
        (item) => item.slug !== slug
      );

    setItems(next);

    localStorage.setItem(
      "eurofoam-wishlist",
      JSON.stringify(next)
    );

    window.dispatchEvent(
      new Event("eurofoam:wishlist")
    );
  }


  if (!ready) return null;


  if (!items.length) {

    return (
      <section className="site-wishlist">

        <div className="site-utility-heading">

          <p className="site-orange">
            THE ONES YOU LIKED.
          </p>

          <h1>
            ABHI
            <br />
            KUCH
            <br />
            NAHI.
          </h1>

        </div>


        <div className="site-empty">

          <span>♡</span>

          <h2>
            DIL DABAO.
            <br />
            YAHAAN MILEGA.
          </h2>

          <p>
            Save the Gaddas you want to come back to.
          </p>

          <Link href="/mattresses">
            SEE THE RANGE →
          </Link>

        </div>

      </section>
    );
  }


  return (
    <section className="site-wishlist">

      <div className="site-utility-heading">

        <p className="site-orange">
          SAVED FOR LATER
        </p>

        <h1>
          TERE
          <br />
          WALE
          <br />
          GADDE.
        </h1>

      </div>


      <div className="site-wishlist-tools">
        <p>Saved is not decided. Compare them before you buy.</p>
        <Link href="/compare">COMPARE GADDAS →</Link>
      </div>

      <div className="site-wishlist-grid">

        {items.map((item, index) => (

          <article
            key={item.slug}
            className="site-wishlist-card"
          >

            <div className="site-wishlist-number">
              {String(index + 1).padStart(2, "0")}
            </div>

            <Link href={`/mattresses/${item.slug}`}>

              <img
                src={item.image}
                alt={item.name}
              />

            </Link>

            <div className="site-wishlist-copy">

              <small>
                {item.kicker}
              </small>

              <Link href={`/mattresses/${item.slug}`}>
                <h2>
                  {item.name}
                </h2>
              </Link>

              <strong>
                {money(item.basePrice)}
              </strong>

              <button
                type="button"
                onClick={() => remove(item.slug)}
              >
                REMOVE
              </button>

            </div>

          </article>

        ))}

      </div>

    </section>
  );
}

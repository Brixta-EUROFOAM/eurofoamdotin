"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/catalog";
import { useState } from "react";
import CheckoutPanel, { OrderDone, type Done } from "@/components/CheckoutPanel";

export default function CartClient() {

  const {
    items,
    removeItem,
    changeQty,
    subtotal,
  } = useCart();
  const [placed, setPlaced] = useState<Done | null>(null);

  return (
    <section className="site-cart">

      <div className="site-utility-heading">
        <p className="site-orange">
          ALMOST YOURS.
        </p>

        <h1>
          YOUR
          <br />
          CART.
        </h1>
      </div>


      {placed ? (

        <div className="site-empty gp-placed">
          <OrderDone done={placed} />
          <Link href="/">BACK TO HOME →</Link>
        </div>

      ) : !items.length ? (

        <div className="site-empty">

          <span>0</span>

          <h2>
            CART MEIN
            <br />
            KUCH NAHI.
          </h2>

          <p>
            Fair enough. The Gaddas are still there.
          </p>

          <Link href="/mattresses">
            GO SEE THEM →
          </Link>

        </div>

      ) : (

        <div className="site-cart-grid">

          <div className="site-cart-items">

            {items.map((item, index) => (

              <article
                key={item.id}
                className="site-cart-item"
              >

                <div className="site-cart-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <img
                  src={item.image}
                  alt={item.name}
                />

                <div className="site-cart-copy">

                  <div>

                    <h2>
                      {item.name}
                    </h2>

                    <p>
                      {item.size} · {item.height}
                      {item.variant ? ` · ${item.variant}` : ""}
                    </p>

                  </div>


                  <strong>
                    {money(item.price * item.quantity)}
                  </strong>


                  <div className="site-cart-controls">

                    <button
                      onClick={() =>
                        changeQty(item.id, item.quantity - 1)
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        changeQty(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>

                    <button
                      className="site-cart-remove"
                      onClick={() => removeItem(item.id)}
                    >
                      REMOVE
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>


          <aside className="site-cart-summary">

            <p className="site-orange">
              ORDER SUMMARY
            </p>

            <div>
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>

            <div>
              <span>Shipping</span>
              <strong>INCLUDED</strong>
            </div>

            <div className="site-cart-total">
              <span>TOTAL</span>
              <strong>{money(subtotal)}</strong>
            </div>

            <CheckoutPanel onPlaced={setPlaced} />

            <div className="site-cart-trust">
              <span>FREE DELIVERY TO YOUR DOOR</span>
              <span>100 NIGHTS TO DECIDE</span>
              <span>WE CALL TO CONFIRM BEFORE ANYTHING SHIPS</span>
            </div>

            <Link href="/mattresses" className="site-cart-continue">
              ← CONTINUE SHOPPING
            </Link>

          </aside>

        </div>

      )}

    </section>
  );
}

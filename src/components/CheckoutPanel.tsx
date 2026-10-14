"use client";

import { useState, type FormEvent } from "react";
import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/catalog";

/*
  Checkout without a payment gateway (yet): the order is saved, the team
  calls to confirm, and the customer pays on delivery or by UPI link.
  Razorpay can slot in here later without changing anything else.
*/
export type Done = { id: string; total: number; whatsapp: string | null };

export default function CheckoutPanel({ onPlaced }: { onPlaced?: (done: Done) => void }) {
  const { items, subtotal, clearCart } = useCart();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const [payment, setPayment] = useState<"pay_on_delivery" | "upi_link">("pay_on_delivery");

  if (done) return <OrderDone done={done} />;

  if (!open) {
    return (
      <button type="button" className="gp-checkout-open" onClick={() => setOpen(true)}>
        CHECKOUT · {money(subtotal)} →
      </button>
    );
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const f = new FormData(e.currentTarget);
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          phone: f.get("phone"),
          email: f.get("email"),
          address: f.get("address"),
          city: f.get("city"),
          pincode: f.get("pincode"),
          notes: f.get("notes"),
          website: f.get("website"),
          payment,
          items: items.map((i) => ({
            slug: i.slug,
            size: i.size,
            height: i.height,
            variant: i.variant,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      const placed = { id: data.id, total: data.total, whatsapp: data.whatsapp || null };
      setDone(placed);
      onPlaced?.(placed);
      clearCart();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="gp-checkout" onSubmit={submit}>
      <p className="site-orange">DELIVERY DETAILS</p>
      <label>
        <span>Full name</span>
        <input name="name" required maxLength={80} autoComplete="name" />
      </label>
      <label>
        <span>Phone</span>
        <input name="phone" required type="tel" inputMode="tel" minLength={10} maxLength={15} autoComplete="tel" />
      </label>
      <label>
        <span>Email (optional)</span>
        <input name="email" type="email" maxLength={120} autoComplete="email" />
      </label>
      <label>
        <span>Address</span>
        <textarea name="address" required rows={2} maxLength={300} autoComplete="street-address" />
      </label>
      <div className="gp-checkout-row">
        <label>
          <span>City</span>
          <input name="city" required maxLength={80} autoComplete="address-level2" />
        </label>
        <label>
          <span>PIN code</span>
          <input name="pincode" required inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="postal-code" />
        </label>
      </div>
      <div className="gp-hp" aria-hidden="true">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="gp-pay">
        <legend>How do you want to pay?</legend>
        <button
          type="button"
          className={payment === "pay_on_delivery" ? "is-on" : ""}
          onClick={() => setPayment("pay_on_delivery")}
        >
          <b>Pay on delivery</b>
          <small>Cash or UPI when it arrives</small>
        </button>
        <button
          type="button"
          className={payment === "upi_link" ? "is-on" : ""}
          onClick={() => setPayment("upi_link")}
        >
          <b>Pay now by UPI</b>
          <small>We send a secure payment link</small>
        </button>
      </fieldset>

      <label>
        <span>Anything we should know? (optional)</span>
        <input name="notes" maxLength={500} placeholder="Floor, lift, best time to call…" />
      </label>

      {error ? (
        <p className="gp-checkout-error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="gp-checkout-open" disabled={sending}>
        {sending ? "PLACING ORDER…" : `PLACE ORDER · ${money(subtotal)} →`}
      </button>
      <small className="gp-checkout-note">
        We call to confirm before anything ships. No payment is taken on this page.
      </small>
    </form>
  );
}

export function OrderDone({ done }: { done: Done }) {
  return (
    <div className="gp-checkout-done" role="status">
      <p className="site-orange">ORDER PLACED</p>
      <strong>{done.id}</strong>
      <span>
        {money(done.total)} · We&apos;ll call you shortly to confirm your delivery date. Keep this order number handy.
      </span>
      {done.whatsapp ? (
        <a href={done.whatsapp} target="_blank" rel="noopener" className="gp-wa">
          Send it to us on WhatsApp →
        </a>
      ) : null}
    </div>
  );
}

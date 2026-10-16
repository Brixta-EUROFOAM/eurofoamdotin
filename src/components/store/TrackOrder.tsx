"use client";

import { useState, type FormEvent } from "react";
import { money } from "@/lib/catalog";

type Result = {
  id: string;
  status: string;
  createdAt: string;
  city: string;
  pincode: string;
  payment: string;
  total: number;
  lines: { name: string; size: string; height: string; quantity: number }[];
};

const FLOW = [
  { id: "new", label: "Order received" },
  { id: "confirmed", label: "Confirmed on call" },
  { id: "dispatched", label: "On its way" },
  { id: "delivered", label: "Delivered" },
];

export default function TrackOrder() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: f.get("id"), phone: f.get("phone") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't look that up. Try again.");
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const at = result ? FLOW.findIndex((s) => s.id === result.status) : -1;

  return (
    <div className="g-narrow" style={{ display: "grid", gap: 20 }}>
      <form className="g-card-flat" style={{ display: "grid", gap: 14 }} onSubmit={submit}>
        <label className="g-field">
          <span>Order number</span>
          <input name="id" required placeholder="GD-261017-AB12" maxLength={30} autoCapitalize="characters" />
        </label>
        <label className="g-field">
          <span>Mobile number used for the order</span>
          <input name="phone" required type="tel" inputMode="tel" maxLength={14} autoComplete="tel-national" />
        </label>
        {error ? (
          <p className="g-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="g-btn" disabled={busy}>
          {busy ? "Looking it up…" : "Track order"}
        </button>
      </form>

      {result ? (
        <section className="g-card-flat" aria-live="polite">
          <div className="g-order-top">
            <b>{result.id}</b>
            <span>{money(result.total)}</span>
          </div>
          <p style={{ color: "var(--g-ink-2)", margin: "6px 0 18px" }}>
            {result.lines.map((l) => `${l.name} ${l.size} ${l.height} × ${l.quantity}`).join("; ")}. To {result.city} {result.pincode}.
          </p>
          {result.status === "cancelled" ? (
            <p className="g-chip">This order was cancelled.</p>
          ) : (
            <ol className="g-checkout-steps" style={{ flexWrap: "wrap" }}>
              {FLOW.map((s, i) => (
                <li key={s.id} data-done={i < at} aria-current={i === at ? "step" : undefined}>
                  {s.label}
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : null}
    </div>
  );
}

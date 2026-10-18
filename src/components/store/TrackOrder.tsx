"use client";

import { useState, type FormEvent } from "react";
import { money } from "@/lib/catalog";

type Result = {
  id: string;
  status: string;
  cancelled?: boolean;
  timeline?: { label: string; done: boolean; current: boolean; at: string | null }[];
  eta?: string | null;
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
          {result.cancelled || result.status === "cancelled" ? (
            <p className="g-chip">This order was cancelled.</p>
          ) : result.timeline?.length ? (
            <>
              <ol className="g-track">
                {result.timeline.map((s, i) => (
                  <li key={i} data-done={s.done || undefined} aria-current={s.current ? "step" : undefined}>
                    <b>{s.label}</b>
                    {s.at ? <span>{when(s.at)}</span> : null}
                  </li>
                ))}
              </ol>
              {result.eta ? (
                <p style={{ margin: "14px 0 0", fontWeight: 700 }}>
                  Expected by {new Date(result.eta).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </p>
              ) : null}
            </>
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

function when(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

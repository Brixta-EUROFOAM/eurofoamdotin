"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import TurnstileWidget from "@/components/store/TurnstileWidget";
import { useLocation } from "@/components/store/LocationProvider";
import { money } from "@/lib/catalog";

type Props = { product: string; concern: string; size: string; height: string; price: number };

/** A voluntary, single-purpose callback request. Reuses the existing CRM + Brevo pipeline.
 *  Never gates quiz results, never pre-checks marketing consent, never exposes visitor IPs. */
export default function SleepMatchLeadCapture({ product, concern, size, height, price }: Props) {
  const { pin, openPicker } = useLocation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [permission, setPermission] = useState(false);
  const [token, setToken] = useState("");
  const [challengeId, setChallengeId] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || done) return;
    if (!permission) { setError("Please confirm you want GADDA to call about this request."); return; }
    const mobile = phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    if (name.trim().length < 2 || !/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter your name and a valid 10-digit mobile number."); return;
    }
    setBusy(true);
    setError("");
    try {
      const message = [
        "SleepMatch: customer requested a call",
        `Recommended: ${product}`,
        `Main concern: ${concern || "Not provided"}`,
        `Configuration: ${size}, ${height}`,
        `Displayed price: ${money(price)}`,
        `PIN: ${pin || "Not supplied"}`,
      ].join(" | ").slice(0, 600);
      const res = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim().slice(0, 80), phone: mobile, when: "Any time", message,
          turnstileToken: token,
          acquisition: { source: "sleepmatch", medium: "onsite", landing: "/sleep-quiz" },
        }),
      });
      const body = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(body.error || "Could not send your request. Please try again.");
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
      // Turnstile tokens are single use. Refresh the challenge on every failed submission.
      setToken("");
      setChallengeId((v) => v + 1);
    } finally { setBusy(false); }
  }

  return (
    <section className="sm5-lead" aria-labelledby="sm5-lead-title">
      <div className="sm5-lead-header">
        <div>
          <p className="sm5-lead-eyebrow">HELP BEFORE YOU BUY</p>
          <h3 id="sm5-lead-title">Want a second opinion on this match?</h3>
          <p>Ask the GADDA team to call about this mattress, sizing or delivery. No marketing subscription required.</p>
        </div>
        {!done && <button type="button" className="sm5-lead-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>{open ? "Close" : "Request a call"} <span aria-hidden="true">→</span></button>}
      </div>
      {done ? <p role="status" className="sm5-lead-success">Request received. We'll contact you during support hours.</p> : null}
      {open && !done ? <form className="sm5-lead-form" onSubmit={submit}>
        <div className="sm5-lead-fields">
          <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" required placeholder="Name" /></label>
          <label>Mobile number<input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="tel" autoComplete="tel-national" pattern="[6-9][0-9]{9}" required placeholder="10-digit mobile number" /></label>
        </div>
        <p className="sm5-lead-pin">Delivery PIN: <b>{pin || "Not checked yet"}</b> <button type="button" onClick={openPicker}>{pin ? "Change" : "Check PIN"}</button></p>
        <label className="sm5-lead-consent"><input type="checkbox" checked={permission} onChange={(e) => setPermission(e.target.checked)} required /> <span>I request a call from GADDA about this mattress. Use my number only to respond to this request.</span></label>
        <TurnstileWidget key={challengeId} action="lead" onToken={setToken} />
        {error ? <p className="sm5-lead-error" role="alert">{error}</p> : null}
        <button type="submit" className="sm5-lead-submit" disabled={busy || !permission}>{busy ? "Sending request…" : "Request callback"}</button>
        <small>By submitting, you agree to be contacted about this enquiry. <Link href="/policies/privacy">Privacy notice</Link>. You can still buy without requesting a call.</small>
      </form> : null}
    </section>
  );
}

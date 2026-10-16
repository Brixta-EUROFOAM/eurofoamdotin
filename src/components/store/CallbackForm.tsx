"use client";

import { useState, type FormEvent } from "react";

export default function CallbackForm() {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(f.entries())),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't send that. Try again.");
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="g-done" role="status">
        <strong style={{ fontSize: "1.6rem" }}>We&apos;ll call you</strong>
        <p style={{ margin: 0 }}>Expect a call from us during working hours. It&apos;ll be a person, not a robot.</p>
      </div>
    );
  }

  return (
    <form className="g-card-flat" style={{ display: "grid", gap: 14 }} onSubmit={submit}>
      <h2 className="g-h3">Request a call back</h2>
      <div className="g-row-2">
        <label className="g-field">
          <span>Name</span>
          <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
        </label>
        <label className="g-field">
          <span>Mobile number</span>
          <input name="phone" type="tel" inputMode="tel" required maxLength={14} autoComplete="tel-national" />
        </label>
      </div>
      <label className="g-field">
        <span>Best time to call</span>
        <select name="when" defaultValue="Any time">
          <option>Any time</option>
          <option>Morning (10–1)</option>
          <option>Afternoon (1–4)</option>
          <option>Evening (4–7)</option>
        </select>
      </label>
      <label className="g-field">
        <span>What would you like to talk about? (optional)</span>
        <textarea name="message" maxLength={600} />
      </label>
      <input name="website" className="g-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <small style={{ color: "var(--g-ink-3)" }}>We use your number only to call you back about this request.</small>
      {error ? (
        <p className="g-error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="g-btn" disabled={state === "busy"}>
        {state === "busy" ? "Sending…" : "Call me back"}
      </button>
    </form>
  );
}

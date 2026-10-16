"use client";

import { useState, type FormEvent } from "react";

/* Opt-in only: the email is stored with the exact wording agreed to and when. */
export default function NewsletterForm() {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), website: form.get("website") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't sign you up. Try again.");
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  }

  if (state === "done") {
    return <p style={{ marginTop: 18, color: "#fff" }}>You&apos;re on the list. Unsubscribe from any email in one click.</p>;
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 22 }}>
      <label htmlFor="news-email" style={{ color: "#fff", fontWeight: 600 }}>
        Rare emails: new mattresses and real offers only
      </label>
      <div className="g-footer-news">
        <input id="news-email" name="email" type="email" required maxLength={120} placeholder="you@example.com" autoComplete="email" />
        <input name="website" className="g-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button type="submit" className="g-btn g-btn--orange g-btn--sm" style={{ minHeight: 46 }} disabled={state === "busy"}>
          Sign up
        </button>
      </div>
      <small style={{ display: "block", marginTop: 8, color: "rgba(255,255,255,.5)" }}>
        By signing up you agree to get marketing emails from GADDA. See our privacy notice.
      </small>
      {error ? (
        <p className="g-error" role="alert" style={{ color: "#ffb4a3", marginTop: 6 }}>
          {error}
        </p>
      ) : null}
    </form>
  );
}

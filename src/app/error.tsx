"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="g-section">
      <div className="g-wrap" style={{ maxWidth: 720 }}>
        <h1 className="g-h2">Something broke on our side.</h1>
        <p className="g-lede">
          Your cart is safe. Try again, and if it keeps happening, call or WhatsApp us
          {error.digest ? ` with this code: ${error.digest}` : ""}.
        </p>
        <div className="g-hero-cta">
          <button type="button" className="g-btn" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="g-btn g-btn--ghost">
            Go to the homepage
          </Link>
        </div>
      </div>
    </main>
  );
}

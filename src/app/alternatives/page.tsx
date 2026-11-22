import type { Metadata } from "next";
import "../sleep-quiz/sleepmatch.css";
import "../sleep-quiz/sleepmatch-extra.css";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ALTERNATIVES } from "@/lib/sleepmatch-alternatives";

export const metadata: Metadata = {
  title: "Mattress Alternatives & Buyer Guides",
  description: "Looking for Wakefit, SleepyCat or The Sleep Company mattress alternatives? Compare comfort, support, delivery expectations, returns and real GADDA construction.",
  alternates: { canonical: "/alternatives" },
};

export default function AlternativesIndex() {
  return <><Header /><main className="sm5-alt-page sm-page" id="main"><div className="g-wrap sm5-alt-wrap">
    <nav className="sm5-alt-crumb"><Link href="/">GADDA</Link> / Mattress alternatives</nav>
    <p className="sm5-alt-eyebrow">INDEPENDENT BUYER RESEARCH</p>
    <h1>Don't buy a replacement mattress on trust alone.</h1>
    <p className="sm5-alt-summary">Delivery concerns, firmness mismatch and complicated trial rules are common questions in online mattress research. Compare terms, material specifications and total price before you choose. These guides address the questions shoppers research about named brands without treating individual complaints as a universal verdict.</p>
    <div className="sm5-alt-list">{ALTERNATIVES.map((a) => <article key={a.slug}><p>{a.focus}</p><h2>{a.brand} mattress alternatives</h2><p>{a.description}</p><Link href={`/alternatives/${a.slug}`}>Read buyer checklist →</Link></article>)}</div>
    <section className="sm5-alt-bottom" aria-label="Return help and mattress problems">
      <h2>Need help with a mattress problem or return?</h2>
      <p><Link href="/guides/the-sleep-company-mattress-return">How to request a The Sleep Company mattress return →</Link> · <Link href="/guides/mattress-problems">Troubleshoot firmness, sinking, heat and trial issues →</Link></p>
      <p>GADDA does not process another seller's returns. Always contact the original seller for refunds or warranty claims.</p>
    </section>
    <div className="sm5-alt-bottom"><h2>Prefer to start with your own sleep problem?</h2><p>SleepMatch compares GADDA Regular, Pro and Ultimate based on comfort preferences and actual layer construction. The finder is free and doesn't require an email address.</p><Link href="/sleep-quiz#sleepmatch" className="sm5-alt-main-cta">Try SleepMatch →</Link></div>
  </div></main><Footer /></>;
}

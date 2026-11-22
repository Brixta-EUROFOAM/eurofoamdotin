import type { Metadata } from "next";
import "../sleep-quiz/sleepmatch.css";
import "../sleep-quiz/sleepmatch-extra.css";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ALTERNATIVES } from "@/lib/sleepmatch-alternatives";

export const metadata: Metadata = {
  title: "Mattress Alternatives & Buying Checklists | GADDA",
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
    <div className="sm5-alt-bottom"><h2>Prefer to start with your own sleep problem?</h2><p>SleepMatch compares GADDA Regular, Pro and Ultimate based on comfort preferences and actual layer construction. The finder is free and doesn't require an email address.</p><Link href="/sleep-quiz#sleepmatch" className="sm5-alt-main-cta">Try SleepMatch →</Link></div>
  </div></main><Footer /></>;
}

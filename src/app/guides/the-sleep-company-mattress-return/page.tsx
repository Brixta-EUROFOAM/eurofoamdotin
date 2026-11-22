import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/store/JsonLd";
import { breadcrumbLd, faqLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How to Return The Sleep Company Mattress: Steps & Trial Rules",
  description: "Returning a The Sleep Company mattress? Find the official contact, trial checks, refund process and exclusions, plus what to consider before buying a replacement.",
  alternates: { canonical: "/guides/the-sleep-company-mattress-return" },
  openGraph: {
    title: "How to Return The Sleep Company Mattress | Independent Guide",
    description: "Practical return-request steps, original policy sources and replacement buying guidance.",
    url: "/guides/the-sleep-company-mattress-return",
  },
};

const source = "https://thesleepcompany.in/pages/100-nights-trial";
const support = "https://thesleepcompany.in/pages/orderdetails";

const faqs = [
  {
    q: "How can I request a return for The Sleep Company mattress?",
    a: "Contact The Sleep Company at care@thesleepcompany.in with your order details, reason for return and photos. Their support team determines eligibility under the terms applicable to your purchase.",
  },
  {
    q: "Can I return any Sleep Company mattress within 100 nights?",
    a: "No. Eligibility depends on the exact product, purchase channel, condition and applicable trial terms. The published policy lists exclusions, so check it before requesting a pickup.",
  },
  {
    q: "Does GADDA handle The Sleep Company returns?",
    a: "No. GADDA is an independent mattress retailer and cannot process returns or refunds for another seller. If you plan to replace your mattress, GADDA delivers only to eligible PIN codes in Assam and Meghalaya.",
  },
  {
    q: "What if my return request is refused?",
    a: "Ask for a written reason that refers to the relevant policy, save your invoice and correspondence, and use the seller's grievance process. Consumer complaint channels may be available for unresolved disputes.",
  },
];

export default async function SleepCompanyReturnGuide() {
  const nonce = (await headers()).get("x-nonce") || undefined;
  return <>
    <Header />
    <JsonLd nonce={nonce} data={[
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Mattress problems", path: "/guides/mattress-problems" },
        { name: "The Sleep Company return", path: "/guides/the-sleep-company-mattress-return" },
      ]),
      faqLd(faqs),
    ]} />
    <main id="main">
      <section className="g-section" style={{ background: "var(--g-cream)" }}>
        <div className="g-wrap" style={{ maxWidth: 880 }}>
          <nav aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/guides/mattress-problems">Mattress problems</Link> / The Sleep Company return</nav>
          <p className="g-chip g-chip--orange" style={{ marginTop: 20 }}>INDEPENDENT RETURN GUIDE</p>
          <h1 className="g-h1">How to return The Sleep Company mattress</h1>
          <p className="g-lede">Start with the seller, not a replacement shop. The Sleep Company says customers can request an eligible mattress return through its support team. The exact trial, condition and purchase-channel rules matter.</p>
          <p style={{ marginTop: 14 }}><a className="g-link" href={source} target="_blank" rel="noopener noreferrer">Read The Sleep Company&apos;s official 100-night trial policy ↗</a></p>
          <small>Checked against published seller information on 22 November 2026. This page is not affiliated with The Sleep Company and is not its customer-service portal.</small>
        </div>
      </section>

      <section className="g-section">
        <div className="g-wrap g-prose" style={{ maxWidth: 880 }}>
          <h2>How to request a return, step by step</h2>
          <ol>
            <li><strong>Find your invoice and delivery date.</strong> Note the order number, model, size, purchase channel and delivery date. Check whether your model and order qualify for the seller&apos;s trial.</li>
            <li><strong>Read the original seller&apos;s terms.</strong> The published policy describes a 100-night window for eligible mattresses, a suggested adjustment period, condition requirements and exclusions. Rules can vary by purchase channel.</li>
            <li><strong>Contact their support directly.</strong> Email <a href="mailto:care@thesleepcompany.in">care@thesleepcompany.in</a>. Explain why you want the return and provide order details. Their <a href={support} target="_blank" rel="noopener noreferrer">official support FAQ</a> also explains how to request a return.</li>
            <li><strong>Supply the requested photos and keep records.</strong> Their published trial terms say photographic evidence may be required. Save your request, replies and the current policy text.</li>
            <li><strong>Wait for the seller&apos;s eligibility decision and pickup instructions.</strong> Do not assume that a return is approved until their team confirms it.</li>
            <li><strong>Track refund and escalation.</strong> Their policy describes refunds after warehouse inspection and approval. If the process stalls, ask for a written status and use their grievance contact.</li>
          </ol>
          <h2>What could make a return ineligible?</h2>
          <p>The official policy excludes certain product categories and purchase situations and requires the mattress to meet condition standards. Check the exact model, seller, purchase channel, damages or stains, the trial clock and special conditions for exchanges. Official pages can differ in their summaries; ask the seller to confirm the policy for your order in writing.</p>
          <p><strong>Important:</strong> A 100-night comfort trial and your legal rights concerning defects or misdescription are not the same thing. For a damaged or faulty product, describe the issue accurately and preserve evidence.</p>
          <h2>What if your mattress feels too hard, hot or unsupportive?</h2>
          <p>Before spending again, identify the actual cause. It might be the comfort layer, your bed base, bedding, the dimensions or a defect. The next purchase should solve that specific problem instead of simply changing brands.</p>
          <ul>
            <li><Link href="/guides/mattress-too-firm">Too hard or uncomfortable at the shoulders and hips?</Link> Learn the difference between cushioning and core support.</li>
            <li><Link href="/guides/mattress-too-soft">Too soft or sinking?</Link> Check the bed base and permanent body impressions first.</li>
            <li><Link href="/guides/sleeping-hot-on-mattress">Sleeping hot?</Link> Compare bedding and materials before relying on cooling claims.</li>
            <li><Link href="/guides/mattress-trial-returns">Confused about trial exclusions?</Link> Use the general pre-purchase returns checklist.</li>
          </ul>
        </div>
      </section>

      <section className="g-section" style={{ background: "var(--g-cream)" }}>
        <div className="g-wrap" style={{ maxWidth: 880 }}>
          <p className="g-chip g-chip--orange">IF YOU ARE CONSIDERING A REPLACEMENT</p>
          <h2 className="g-h2">Compare a different construction—not just a different logo.</h2>
          <p>GADDA Regular, Pro and Ultimate have different foam and support-layer arrangements. Choose by your sleep position, preferred surface feel, mattress size and budget. No GADDA product copies The Sleep Company&apos;s proprietary SmartGRID technology.</p>
          <p><strong>Delivery is currently restricted to eligible Assam and Meghalaya PIN codes.</strong> A GADDA purchase does not change another seller&apos;s return decision.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <Link className="g-btn g-btn--orange" href="/sleep-quiz#sleepmatch">Find a mattress for my problem</Link>
            <Link className="g-btn g-btn--ghost" href="/alternatives/the-sleep-company-mattress">Compare mattress constructions</Link>
            <Link className="g-btn g-btn--ghost" href="/compare">Compare GADDA models</Link>
          </div>
        </div>
      </section>
      <section className="g-section">
        <div className="g-wrap" style={{ maxWidth: 880 }}>
          <h2 className="g-h2">Frequently asked questions</h2>
          {faqs.map((f) => <div key={f.q} style={{ marginTop: 24 }}><h3 className="g-h3">{f.q}</h3><p>{f.a}</p></div>)}
          <p className="g-note" style={{ marginTop: 24 }}>Sources: <a className="g-link" href={source} target="_blank" rel="noopener noreferrer">The Sleep Company trial policy</a> and <a className="g-link" href={support} target="_blank" rel="noopener noreferrer">official order and returns FAQ</a>. Always check their current terms directly.</p>
        </div>
      </section>
    </main>
    <Footer />
  </>;
}

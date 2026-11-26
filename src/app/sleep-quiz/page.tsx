import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SleepQuiz from "@/components/SleepQuiz";
import SleepMatchV11 from "@/components/sleepmatch-v11/SleepMatchV11";
import type { CampaignKey } from "@/components/sleepmatch-v11/campaigns";
import SleepMatchFilm from "@/components/store/SleepMatchFilm";
import SleepMatchPinPrompt from "@/components/store/SleepMatchPinPrompt";
import ProductVisual from "@/components/store/ProductVisual";
import JsonLd from "@/components/store/JsonLd";
import { getStoreData } from "@/lib/store";
import { money } from "@/lib/catalog";
import { breadcrumbLd } from "@/lib/seo";
import { siteUrl } from "@/lib/public-url";
import "./sleepmatch.css";
import "./sleepmatch-story.css";
import "./sleepmatch-extra.css";
import "./sleepmatch-v11.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mattress Finder | Three Mattresses. No Nonsense." ,
  description: "Bed too hard, too soft, too warm or just uncomfortable? Start with your concern and compare three GADDA mattresses in four questions. Assam and Meghalaya delivery eligibility.",
  alternates: { canonical: "/sleep-quiz" },
  openGraph: {
    title: "SleepMatch | Which GADDA Mattress Is Right for You?",
    description: "Real foam constructions, clear trade-offs and a four-question mattress finder with an instant price and checkout.",
    url: "/sleep-quiz",
  },
};

const problemGuides = [
  { id: "01", label: "My mattress is too firm", detail: "What to check when shoulders and hips feel uncomfortable.", href: "/guides/mattress-too-firm", problem: "firm" },
  { id: "02", label: "My mattress sinks too much", detail: "Firmness, support and how they differ.", href: "/guides/mattress-too-soft", problem: "sinking" },
  { id: "03", label: "I sleep too hot", detail: "Cooling materials, breathable covers and realistic trade-offs.", href: "/guides/sleeping-hot-on-mattress", problem: "hot" },
];

const positioning: Record<string, { problem: string; tradeoff: string }> = {
  "gadda-regular": {
    problem: "Support. Without the unnecessary extras.",
    tradeoff: "A simple high-density foam foundation with a soft top. Less contouring than memory-foam models.",
  },
  "gadda-pro": {
    problem: "Cushioned where you need it. Supported where it matters.",
    tradeoff: "Memory foam over a 32D HR base. Pocket springs are optional, at an additional cost.",
  },
  "gadda-ultimate": {
    problem: "More responsive comfort. Temperature in mind.",
    tradeoff: "Cooling-oriented memory foam and adaptive foam over 40D HR. Cooling is not a guaranteed temperature reduction.",
  },
};

const faqs = [
  { question: "How does SleepMatch choose a mattress?", answer: "The four-question tool scores your main concern, sleeping position, preferred surface feel and buying priorities against the three GADDA constructions. It is a preference-based shortlist, not a medical assessment or laboratory comfort test." },
  { question: "What's the difference between a firm mattress and a supportive mattress?", answer: "Firmness describes how a surface feels. Support describes how the mattress helps hold the body. A soft comfort layer can sit above a firmer base, so a supportive mattress does not have to feel uniformly hard." },
  { question: "Is cooling memory foam guaranteed to stop night sweats?", answer: "No. Temperature depends on covers, bedding, room temperature, ventilation and the sleeper. The Ultimate includes a cooling-oriented comfort layer, but no universal temperature reduction is promised." },
  { question: "Do I have to enter my phone number or email before seeing my result?", answer: "No. SleepMatch shows its recommendation and size-based price without signing up. A skippable PIN prompt helps check delivery, and an optional callback request lets you ask for advice. Neither is required to see your result." },
  { question: "Can I use the 100-night trial on any mattress or custom size?", answer: "Not necessarily. Eligibility, exclusions, product condition and collection conditions are governed by GADDA's published trial policy. Read the full terms before ordering." },
  { question: "Where can GADDA deliver?", answer: "GADDA screens PIN codes for Assam and Meghalaya. Final order eligibility depends on the exact delivery address and serviceability validation at checkout." },
];

const AD_JOURNEYS: Record<string, {headline:string;intro:string}> = {"tired": {"headline": "Eight hours. Still exhausted?", "intro": "More sleep does not always mean better rest. Let’s check whether your bed is making comfort harder, without assuming your mattress is the cause."}, "hot": {"headline": "Your bed shouldn't feel like a heater.", "intro": "Start with where the warmth comes from. Compare materials, bedding and room conditions before paying for a cooling upgrade."}, "restless": {"headline": "47 positions. Still uncomfortable.", "intro": "Side. Back. Side again. Let’s work out whether you want more cushioning, less sink, or simply a different feel."}, "stiff": {"headline": "Your morning shouldn't start with a backache.", "intro": "Firmness and support are not the same. Let’s compare your preferred feel and sleeping position, without promising to treat pain."}, "cold": {"headline": "Waking up cold again?", "intro": "Before you replace your mattress, check the layers you sleep under and the room you sleep in. Then we can compare the feel of your bed."}};

const V11_CAMPAIGNS = new Set<CampaignKey>(["hot", "cold", "tired", "restless", "stiff"]);

export default async function SleepQuizPage({ searchParams }: { searchParams: Promise<{ concern?: string | string[] }> }) {
  const query = await searchParams;
  const key = typeof query.concern === "string" ? query.concern : "";
  const v11Campaign = V11_CAMPAIGNS.has(key as CampaignKey) ? (key as CampaignKey) : null;
  const campaign = Object.prototype.hasOwnProperty.call(AD_JOURNEYS, key) ? AD_JOURNEYS[key] : undefined;
  const { products } = await getStoreData();
  const nonce = (await headers()).get("x-nonce") || undefined;
  const filmProducts = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    image: p.image,
    firmness: p.firmness,
    longDescription: p.longDescription,
    layers: p.layers.map((layer) => ({ name: layer.name, material: layer.material, description: layer.description, visualKind: layer.visualKind })),
  }));
  const hero = products.find((p) => p.slug === "gadda-pro") || products[0];
  return (
    <>
      <Header />
      <JsonLd nonce={nonce} data={[
        breadcrumbLd([{ name: "Home", path: "/" }, { name: "SleepMatch", path: "/sleep-quiz" }]),
        { "@context": "https://schema.org", "@type": "ItemList", name: "GADDA mattress constructions", itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: siteUrl(`/mattresses/${p.slug}`) })) },
      ]} />
      <main className="sm4-page sm-page" id="main">
        {v11Campaign ? (
          <SleepMatchV11 products={products} campaign={v11Campaign} />
        ) : (
        <>
        {campaign ? <section className="sm7-campaign-hero" aria-labelledby="sm4-title"><div className="g-wrap"><p className="sm4-kicker">GADDA / THREE MATTRESSES. NO NONSENSE.</p><h1 id="sm4-title">{campaign.headline}</h1><p>{campaign.intro}</p><a href="#sleepmatch" className="sm4-btn">Find my fit →</a><small>Four illustrated questions. No account required.</small></div></section> : <section className="sm4-hero" aria-labelledby="sm4-title">
          <div className="g-wrap sm4-hero-grid">
            <div className="sm4-hero-copy">
              <p className="sm4-kicker">GADDA / SLEEPMATCH</p>
              <h1 id="sm4-title">Three mattresses.<br /><em>No nonsense.</em></h1>
              <p className="sm4-lede">What if choosing a mattress started with what bothers you at night, instead of a catalogue full of foam names? Tell us what feels wrong. We will help you compare three real constructions and find a sensible fit.</p>
              <div className="sm4-hero-actions">
                <a className="sm4-btn" href="#sleepmatch">Start with my problem <span aria-hidden="true">→</span></a>
                <a className="sm4-quiet-link" href="#construction">See what&apos;s inside <span aria-hidden="true">↓</span></a>
              </div>
              <p className="sm4-hero-proof">Four questions. Three real mattresses. No email gate. No automatic upsell.</p>
              <div className="sm-v6-campaigns" aria-label="Start with a common sleep concern">
                {[["hot", "Sleeping too warm"], ["cold", "Waking up cold"], ["tired", "Waking up tired"], ["restless", "Can't get comfortable"], ["stiff", "Waking up stiff"]].map(([key, label]) => <a key={key} href={`/sleep-quiz?concern=${key}#sleepmatch`}>{label}</a>)}
              </div>
              <SleepMatchPinPrompt />
            </div>
            <div className="sm4-hero-visual" aria-label="GADDA Pro mattress construction photography">
              {hero ? <ProductVisual image={hero.cardImage || hero.image} layers={hero.layers} alt={`${hero.name}, real GADDA catalogue photo`} /> : null}
              <div className="sm4-hero-visual-caption"><span>01 / THE MATERIALS</span><span>{hero?.name || "GADDA"} · Layer construction</span></div>
            </div>
          </div>
          <div className="sm4-hero-rule"><div className="g-wrap"><span>WHAT&apos;S INSIDE MATTERS</span><span>START WITH YOUR CONCERN</span></div></div>
        </section>}

        <section className="sm4-match" id="sleepmatch" aria-labelledby="sm4-match-title">
          <div className="g-wrap sm4-match-grid">
            <div className="sm4-match-aside">
              <p className="sm4-kicker">THE FINDER</p>
              <h2 id="sm4-match-title">What is your bed getting wrong?</h2>
              <p>Start with your experience. We explain why it matters, compare your comfort preferences, and show the closest of our three builds with a real configuration price. No pressure to buy the premium one.</p>
              <dl>
                <div><dt>01</dt><dd>What bothers you now</dd></div>
                <div><dt>02</dt><dd>How you normally sleep</dd></div>
                <div><dt>03</dt><dd>Your ideal mattress feel</dd></div>
                <div><dt>04</dt><dd>Your buying priority</dd></div>
              </dl>
              <small>Your result is a preference-based recommendation, not a medical diagnosis or a guarantee.</small>
            </div>
            <div className="sm4-match-tool"><SleepQuiz products={products} initialConcern={campaign ? key : ""} /></div>
          </div>
        </section>
        </>
        )}

        <section className="sm4-opening" id="construction" aria-labelledby="sm4-construction-title">
          <div className="g-wrap sm4-opening-grid">
            <p className="sm4-kicker">THE MATERIALS, EXPLAINED</p>
            <div>
              <h2 id="sm4-construction-title">Three builds. Three different kinds of comfort.</h2>
              <p>We don&apos;t need to invent a miracle material. GADDA Regular, Pro and Ultimate use different comfort layers and support bases. Explore the actual layer names and product imagery, then decide which trade-offs matter to you.</p>
            </div>
          </div>
          <div className="g-wrap">
            <SleepMatchFilm products={filmProducts} />
          </div>
          <div className="g-wrap sm4-bridge">
            <div><p className="sm4-kicker">YOUR TURN</p><h2>Want to check your own <em>match?</em></h2></div>
            <a href="#sleepmatch" className="sm4-btn">Take the four-question match <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <section className="sm4-range" aria-labelledby="sm4-range-title">
          <div className="g-wrap">
            <div className="sm4-section-top"><div><p className="sm4-kicker">THE REAL COMPARISON</p><h2 id="sm4-range-title">The right feel, with the specs in plain sight.</h2></div><Link href="/compare" className="sm4-quiet-link">Detailed size-by-size comparison →</Link></div>
            <div className="sm4-table-scroll" role="region" aria-label="Compare GADDA mattress range" tabIndex={0}>
              <table>
                <thead><tr><th scope="col">Mattress</th><th scope="col">Designed for this preference</th><th scope="col">What you trade off</th><th scope="col">Starts at</th><th scope="col"><span className="g-sr">Product link</span></th></tr></thead>
                <tbody>{products.map((p) => <tr key={p.slug}>
                  <th scope="row"><div className="sm4-table-product"><div className="sm4-table-photo"><ProductVisual image={p.cardImage || p.image} layers={p.layers} alt={`${p.name} mattress`} /></div><div><b>{p.name}</b><small>{p.firmness}</small></div></div></th>
                  <td>{positioning[p.slug]?.problem || p.shortDescription}</td>
                  <td>{positioning[p.slug]?.tradeoff || p.longDescription}</td>
                  <td className="sm4-tabular"><b>{money(p.basePrice)}</b><small>From · GST included</small></td>
                  <td><Link href={`/mattresses/${p.slug}?variant=true`}>Choose size →</Link></td>
                </tr>)}</tbody>
              </table>
            </div>
            <p className="sm4-table-foot">Prices shown are catalogue starting prices, not a quote for your bed size. The quiz and product pages calculate actual dimensions, thickness and upgrades; checkout verifies delivery eligibility.</p>
          </div>
        </section>

        <section className="sm4-guides" aria-labelledby="sm4-guides-title">
          <div className="g-wrap sm4-guides-layout">
            <div><p className="sm4-kicker">NOT READY TO CHOOSE?</p><h2 id="sm4-guides-title">Start with the problem, not the brand.</h2><p>These guides explain common mattress frustrations. Each one takes you into SleepMatch with that concern already selected.</p></div>
            <div className="sm4-guide-list">
              {problemGuides.map((guide) => <article key={guide.id}>
                <span className="sm4-tabular">{guide.id}</span>
                <div><h3>{guide.label}</h3><p>{guide.detail}</p><div><Link href={guide.href}>Read the guide</Link><Link href={`/sleep-quiz?problem=${guide.problem}#sleepmatch`}>Find my match →</Link></div></div>
              </article>)}
              <article><span className="sm4-tabular">04</span><div><h3>I&apos;m worried about returns</h3><p>Read the written trial rules, pickup conditions and exclusions before committing.</p><div><Link href="/guides/mattress-trial-returns">Trial and returns guide</Link><Link href="/policies/trial">Current GADDA policy →</Link></div></div></article>
            </div>
          </div>
        </section>


        <section className="sm5-search" aria-labelledby="sm5-search-title">
          <div className="g-wrap">
            <div className="sm5-search-top"><div><p className="sm4-kicker">BUYING AFTER RESEARCHING A REVIEW?</p><h2 id="sm5-search-title">Searching for a mattress alternative? Start with what went wrong.</h2></div>
              <p>Delivery worries, a mattress that feels too hard, or a confusing return policy are different problems. We help you examine the original concern and compare real constructions, not make unverified claims about another brand.</p>
            </div>
            <div className="sm5-search-list">
              <article><span>DELIVERY &amp; SUPPORT</span><div><h3>Wakefit mattress alternatives</h3><p>What to check about your PIN, service commitments, returns and total delivered cost.</p></div><Link href="/alternatives/wakefit-mattress">Read buyer checklist →</Link></article>
              <article><span>FIRMNESS &amp; FIT</span><div><h3>SleepyCat mattress alternatives</h3><p>Separate surface comfort from support, and find what a real foam-layer specification can tell you.</p></div><Link href="/alternatives/sleepycat-mattress">Compare the questions →</Link></article>
              <article><span>COMFORT TECHNOLOGY</span><div><h3>The Sleep Company mattress alternatives</h3><p>Evaluate material claims, size-based prices, support design and written trial eligibility.</p></div><Link href="/alternatives/the-sleep-company-mattress">Explore the comparison →</Link></article>
            </div>
            <p className="sm5-search-note">GADDA is not affiliated with these brands. Reviews are individual accounts, not proof of brand-wide performance. Each guide links to independent buyer discussions and provides a practical comparison checklist. <Link href="/alternatives">All mattress buying checklists →</Link></p>
          </div>
        </section>

        <section className="sm4-answers" aria-labelledby="sm4-answers-title">
          <div className="g-wrap sm4-answers-grid">
            <div><p className="sm4-kicker">REAL QUESTIONS</p><h2 id="sm4-answers-title">Before you order.</h2><p>Check your dimensions, shipping eligibility and the published trial terms. Don&apos;t buy based on a badge alone.</p><Link href="/size-guide" className="sm4-quiet-link">How to measure your bed →</Link></div>
            <div className="sm4-faq-list">{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}<p className="sm4-answers-notice">Delivery eligibility is currently screened for Assam and Meghalaya. <Link href="/policies/shipping">Shipping policy</Link> · <Link href="/policies/trial">Trial policy</Link></p></div>
          </div>
        </section>

        <div className="sm4-mobile-action"><span>Not sure which mattress?</span><a href="#sleepmatch">Find my match →</a></div>
      </main>
      <Footer />
    </>
  );
}

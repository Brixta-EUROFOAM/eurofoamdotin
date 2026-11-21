"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProductVisual from "@/components/store/ProductVisual";
import { useCart } from "@/components/CartProvider";
import { money, type Mattress } from "@/lib/catalog";
import { mattressPrice } from "@/lib/mattress-pricing";
import { SIZE_GROUPS, type SizeRow } from "@/lib/sizes";
import { trackEvent } from "@/lib/telemetry-client";

type MatchKey = "regular" | "pro" | "ultimate";
type Option = {
  label: string;
  hint: string;
  symbol: string;
  score: Partial<Record<MatchKey, number>>;
  why: string;
};
type Question = { eyebrow: string; title: string; subtitle: string; choices: Option[] };

/* An honest, deterministic preference matcher—not a clinical assessment.
   The problem receives the highest weight. Later answers refine the match. */
const QUESTIONS: Question[] = [
  {
    eyebrow: "First, the problem",
    title: "What's ruining your sleep?",
    subtitle: "Pick the one thing you most want your next mattress to get right.",
    choices: [
      { label: "My mattress feels too hard", hint: "My shoulders or hips want more cushioning", symbol: "01", score: { pro: 9, ultimate: 4 }, why: "you want more cushioning at the surface" },
      { label: "I sink in too much", hint: "I want a steadier, firmer surface", symbol: "02", score: { regular: 10, pro: 1 }, why: "you prefer a firmer, steadier feel" },
      { label: "I feel too hot at night", hint: "Temperature and surface comfort matter most", symbol: "03", score: { ultimate: 10, pro: 1 }, why: "you want to explore cooling-oriented comfort materials" },
      { label: "My partner keeps moving", hint: "I want a less distracting surface", symbol: "04", score: { pro: 8, ultimate: 4 }, why: "you share your bed and care about movement" },
      { label: "I don't want to overspend", hint: "Give me a proper mattress without unnecessary extras", symbol: "05", score: { regular: 10, pro: 1 }, why: "you value straightforward construction and price" },
      { label: "I honestly have no idea", hint: "Help me choose without the mattress jargon", symbol: "06", score: { pro: 3, regular: 2, ultimate: 2 }, why: "you want a balanced place to start" },
    ],
  },
  {
    eyebrow: "How you sleep",
    title: "Your usual sleeping position?",
    subtitle: "No perfect answer. Go with how you normally fall asleep.",
    choices: [
      { label: "On my side", hint: "Pressure around shoulders and hips matters", symbol: "A", score: { pro: 3, ultimate: 3 }, why: "you mainly sleep on your side" },
      { label: "On my back", hint: "I like even, steady support", symbol: "B", score: { pro: 3, regular: 2 }, why: "you mainly sleep on your back" },
      { label: "On my stomach", hint: "I prefer less sink around the hips", symbol: "C", score: { regular: 4, pro: 1 }, why: "you mainly sleep on your stomach" },
      { label: "A bit of everything", hint: "I move around through the night", symbol: "D", score: { pro: 3, ultimate: 1 }, why: "you change positions during the night" },
    ],
  },
  {
    eyebrow: "The feel",
    title: "How should your bed feel?",
    subtitle: "Think of the most comfortable mattress you've tried.",
    choices: [
      { label: "Firm and steady", hint: "Lie on top of the mattress", symbol: "I", score: { regular: 6, pro: 1 }, why: "you prefer a firm surface" },
      { label: "Balanced", hint: "Support underneath, comfortable on top", symbol: "II", score: { pro: 7 }, why: "you prefer a balanced feel" },
      { label: "Plush and cushioned", hint: "A little more of that sink-in comfort", symbol: "III", score: { ultimate: 7, pro: 1 }, why: "you enjoy a plush feel" },
    ],
  },
  {
    eyebrow: "Your priority",
    title: "What matters most when you buy?",
    subtitle: "This last answer helps break close matches.",
    choices: [
      { label: "Keep the price sensible", hint: "The right essentials, nothing extra", symbol: "₹", score: { regular: 7, pro: 1 }, why: "you want value before upgrades" },
      { label: "Balanced everyday comfort", hint: "A considered middle ground", symbol: "✓", score: { pro: 7 }, why: "you prioritise balanced everyday comfort" },
      { label: "Premium comfort materials", hint: "I'm open to paying more for the feel", symbol: "+", score: { ultimate: 7 }, why: "you are considering premium comfort layers" },
    ],
  },
];

const POSITION: Record<MatchKey, { tagline: string; angle: string; check: string[] }> = {
  regular: {
    tagline: "The steady, straightforward one",
    angle: "A firmer foam feel, without paying for premium layers you may not need.",
    check: ["High-density foam support base", "Soft comfort layer", "Firmer feel"],
  },
  pro: {
    tagline: "The balanced-comfort one",
    angle: "Memory-foam comfort over a responsive HR support base, with a pocket-spring option.",
    check: ["Memory foam comfort", "32D HR support base", "Optional pocket springs"],
  },
  ultimate: {
    tagline: "The plush-and-responsive one",
    angle: "A cooling-oriented memory-foam top, adaptive comfort and a denser HR base.",
    check: ["Cooling-oriented memory foam", "Adaptive comfort layer", "40D HR support base"],
  },
};

function keyOf(p: Mattress): MatchKey {
  const value = `${p.slug} ${p.name}`.toLowerCase();
  if (value.includes("ultimate")) return "ultimate";
  if (value.includes("regular")) return "regular";
  return "pro";
}

function standardSize(rows: SizeRow[], group: string) {
  const common = SIZE_GROUPS.find((g) => g.id === group)?.common;
  if (!common || rows.length === 0) return rows[0]?.label || "";
  return rows.find((r) => r.length === common[0] && r.width === common[1])?.label || rows[0].label;
}

function readableSize(label: string) {
  return label.replace(/^(Single|Double|Queen|King)\s*/, "").replace(/ in$/, " inches");
}

export default function SleepQuiz({ products }: { products: Mattress[] }) {
  const router = useRouter();
  const { addItem, hydrated, count } = useCart();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [group, setGroup] = useState("Queen");
  const [sizeChoice, setSizeChoice] = useState("");
  const [heightChoice, setHeightChoice] = useState("");
  const [upgrades, setUpgrades] = useState<Record<string, string>>({});
  const [checkingOut, setCheckingOut] = useState(false);
  const [guideProblem, setGuideProblem] = useState("");
  const finished = step >= QUESTIONS.length;

  // Guides can bring a visitor's explicitly stated problem into SleepMatch.
  // The visitor sees the selected concern and can go Back to change it.
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("problem");
    const idx: Record<string, number> = { firm: 0, sinking: 1, hot: 2 };
    if (key && Object.prototype.hasOwnProperty.call(idx, key)) {
      const chosen = QUESTIONS[0].choices[idx[key]];
      setAnswers([chosen]);
      setGuideProblem(chosen.label);
      setStep(1);
      trackEvent("quiz_start", { label: chosen.label });
    }
  }, []);

  const ranked = useMemo(() => {
    const scores: Record<MatchKey, number> = { regular: 0, pro: 0, ultimate: 0 };
    for (const answer of answers) {
      for (const [key, points] of Object.entries(answer.score)) scores[key as MatchKey] += points || 0;
    }
    // No mutation of the incoming server catalogue.
    return [...products].sort((a, b) => scores[keyOf(b)] - scores[keyOf(a)]);
  }, [answers, products]);

  const best = ranked[0];
  const availableGroups = useMemo(() => SIZE_GROUPS.filter((g) =>
    best?.sizes.some((s) => (s as SizeRow).group === g.id || s.label === g.id || s.label.startsWith(`${g.id} `))
  ), [best]);
  const activeGroup = availableGroups.some((g) => g.id === group) ? group : (availableGroups[0]?.id || "");
  const groupSizes = useMemo(() => (best?.sizes as SizeRow[] || []).filter((s) =>
    s.group === activeGroup || s.label === activeGroup || s.label.startsWith(`${activeGroup} `)
  ), [best, activeGroup]);
  const size = groupSizes.some((s) => s.label === sizeChoice) ? sizeChoice : standardSize(groupSizes, activeGroup);
  const height = best?.heights.some((h) => h.label === heightChoice) ? heightChoice : best?.heights[0]?.label || "";
  const variant = (best?.options || []).map((o) => {
    const picked = upgrades[o.id];
    return o.choices.find((c) => c.label === picked)?.label || o.choices[0]?.label || "";
  }).filter(Boolean).join(" · ");
  const price = best && size && height
    ? (mattressPrice(best, size, height, variant) ?? (() => {
      const s = best.sizes.find((v) => v.label === size);
      const h = best.heights.find((v) => v.label === height);
      const extra = (best.options || []).reduce((n, o) => n + ((o.choices.find((c) => c.label === upgrades[o.id]) || o.choices[0])?.priceAdd || 0), 0);
      return best.basePrice + (s?.priceAdd || 0) + (h?.priceAdd || 0) + extra;
    })()) : null;

  useEffect(() => {
    if (finished && best) {
      trackEvent("quiz_complete", { productSlug: best.slug, label: answers[0]?.label || best.slug });
      trackEvent("quiz_result_view", { productSlug: best.slug, label: best.slug });
    }
  }, [finished, best, answers]);

  function choose(option: Option) {
    const next = [...answers.slice(0, step), option];
    setAnswers(next);
    if (step === 0) trackEvent("quiz_start", { label: option.label });
    trackEvent("quiz_step", { label: String(step + 1) });
    setStep(step + 1);
  }

  function reset() {
    setAnswers([]);
    setStep(0);
    setGroup("Queen");
    setSizeChoice("");
    setHeightChoice("");
    setUpgrades({});
    setCheckingOut(false);
    setGuideProblem("");
  }

  function buyNow() {
    if (!best || !size || !height || price === null || !hydrated || checkingOut) return;
    setCheckingOut(true);
    addItem({
      id: `${best.slug}-${size}-${height}${variant ? `-${variant}` : ""}`,
      slug: best.slug,
      name: best.name,
      image: best.image,
      size,
      height,
      variant: variant || undefined,
      price,
      quantity: 1,
    }, { open: false });
    trackEvent("quiz_checkout_click", { productSlug: best.slug, value: price, label: `${size} ${height}` });
    router.push("/checkout");
  }

  if (!products.length) return <div className="sm-quiz sm-empty">Our mattress finder is temporarily unavailable. <Link href="/mattresses">Browse mattresses</Link>.</div>;

  if (finished && best) {
    const positioning = POSITION[keyOf(best)];
    const sizeIsReady = Boolean(size && height && price !== null);
    return (
      <div className="sm-quiz sm-result" aria-live="polite">
        <div className="sm-result-top">
          <span className="sm-pill sm-pill--success"><span aria-hidden="true">✓</span> Your SleepMatch result</span>
          <button type="button" className="sm-text-button" onClick={reset}>Start over ↺</button>
        </div>
        <div className="sm-result-layout">
          <div className="sm-result-art">
            <div className="sm-result-photo"><ProductVisual image={best.image} layers={best.layers} alt={`${best.name} construction`} /></div>
            <span className="sm-result-stamp">Your top match</span>
            <div className="sm-result-features">{positioning.check.map((t) => <span key={t}>✓ {t}</span>)}</div>
          </div>
          <div className="sm-result-detail">
            <p className="sm-kicker">WE FOUND YOUR STARTING POINT</p>
            <h2 className="sm-result-name">{best.name}</h2>
            <p className="sm-result-tag">{positioning.tagline}</p>
            <p className="sm-result-why">{positioning.angle}</p>
            <div className="sm-why-box">
              <b>Why we picked it for you</b>
              <ul>{answers.filter((a) => a.why).slice(0, 3).map((a, i) => <li key={`${a.label}-${i}`}>{a.why}</li>)}</ul>
            </div>
            <div className="sm-config" aria-labelledby="sm-config-title">
              <div className="sm-config-head"><h3 id="sm-config-title">Make it yours</h3><Link href="/size-guide" target="_blank" rel="noopener noreferrer">Measure your bed ↗</Link></div>
              <p className="sm-config-note">Pick your bed size and thickness. Price updates instantly.</p>
              <div className="sm-size-groups" role="group" aria-label="Mattress size family">
                {availableGroups.map((g) => <button key={g.id} type="button" className={activeGroup === g.id ? "sm-size-chip is-active" : "sm-size-chip"} aria-pressed={activeGroup === g.id} onClick={() => { setGroup(g.id); setSizeChoice(""); }}>{g.id}</button>)}
              </div>
              <div className="sm-fields">
                <label>Exact dimensions
                  <select value={size} onChange={(e: { target: { value: string } }) => setSizeChoice(e.target.value)}>
                    {groupSizes.map((s) => <option key={s.label} value={s.label}>{readableSize(s.label)}</option>)}
                  </select>
                </label>
                <label>Thickness
                  <select value={height} onChange={(e: { target: { value: string } }) => setHeightChoice(e.target.value)}>
                    {best.heights.map((h) => <option value={h.label} key={h.label}>{h.label}</option>)}
                  </select>
                </label>
              </div>
              {(best.options || []).map((opt) => (
                <label className="sm-upgrade" key={opt.id}>{opt.label}
                  <select value={upgrades[opt.id] && opt.choices.some((c) => c.label === upgrades[opt.id]) ? upgrades[opt.id] : (opt.choices[0]?.label || "")}
                    onChange={(e: { target: { value: string } }) => setUpgrades((prev) => ({ ...prev, [opt.id]: e.target.value }))}>
                    {opt.choices.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
                  </select>
                </label>
              ))}
              <div className="sm-purchase">
                <div><span>Price for your configuration</span><strong>{sizeIsReady ? money(price!) : "Choose your size"}</strong><small>GST included · Delivery allowance included</small></div>
                <button className="sm-buy" type="button" disabled={!sizeIsReady || !hydrated || checkingOut} onClick={buyNow}>
                  {checkingOut ? "Opening checkout…" : "Continue to checkout"}<span aria-hidden="true">↗</span>
                </button>
              </div>
              {count > 0 && <p className="sm-cart-notice">You already have {count} item{count > 1 ? "s" : ""} in your cart. This match will be added to your existing checkout.</p>}
              <p className="sm-fineprint">Your delivery PIN will be checked at checkout. Currently serving eligible PIN codes in Assam and Meghalaya. <Link href="/policies/trial">Read the 100-night trial terms.</Link></p>
            </div>
            <div className="sm-result-links"><Link href={`/mattresses/${best.slug}?variant=true`}>View complete specs & custom sizes ↗</Link>{ranked[1] && <Link href={`/mattresses/${ranked[1].slug}`}>Compare with {ranked[1].name} ↗</Link>}</div>
          </div>
        </div>
      </div>
    );
  }

  const question = QUESTIONS[step];
  return (
    <div className="sm-quiz" aria-live="polite">
      <div className="sm-quiz-head">
        <span className="sm-pill"><span aria-hidden="true">✳</span> 4 quick questions · no signup</span>
        <span className="sm-step-count">{String(step + 1).padStart(2, "0")} <span>/ {String(QUESTIONS.length).padStart(2, "0")}</span></span>
      </div>
      <div className="sm-progress" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={step}><span style={{ width: `${(step / QUESTIONS.length) * 100}%` }} /></div>
      {guideProblem && step === 1 && <p className="sm-guide-context">Your starting problem: <strong>{guideProblem}</strong>. <button type="button" onClick={() => setStep(0)}>Change</button></p>}
      <p className="sm-kicker">{question.eyebrow}</p>
      <h2 className="sm-question-title">{question.title}</h2>
      <p className="sm-question-subtitle">{question.subtitle}</p>
      <div className="sm-options" role="group" aria-label={question.title}>
        {question.choices.map((choice) => <button type="button" key={choice.label} className="sm-option" onClick={() => choose(choice)}>
          <span className="sm-option-symbol" aria-hidden="true">{choice.symbol}</span>
          <span className="sm-option-copy"><strong>{choice.label}</strong><small>{choice.hint}</small></span>
          <span className="sm-option-arrow" aria-hidden="true">↗</span>
        </button>)}
      </div>
      <div className="sm-quiz-foot">
        {step > 0 ? <button className="sm-text-button" type="button" onClick={() => setStep((s) => s - 1)}>← Back</button> : <span>No account required</span>}
        <span>Your result appears instantly</span>
      </div>
    </div>
  );
}

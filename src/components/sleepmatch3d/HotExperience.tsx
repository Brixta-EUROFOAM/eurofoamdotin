"use client";
/*
  GADDA V9 — Sleeping Hot Interactive 3D Experience (/sleep-quiz?concern=hot).
  One dominant Remotion + Three.js 3D stage paired with an editorial
  questionnaire and the existing GADDA recommendation, pricing, cart,
  PIN-check, lead-capture and Razorpay checkout infrastructure.
*/
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import SleepMatchLeadCapture from "@/components/store/SleepMatchLeadCapture";
import SleepMatchPinPrompt from "@/components/store/SleepMatchPinPrompt";
import { layersWithChoices, money, type Mattress } from "@/lib/catalog";
import { mattressPrice } from "@/lib/mattress-pricing";
import { SIZE_GROUPS, type SizeRow } from "@/lib/sizes";
import { trackEvent } from "@/lib/telemetry-client";
import type { MatchKey, SceneKey, StageStack } from "./world";

const HotStage = dynamic(() => import("./HotStage"), {
  ssr: false,
  loading: () => (
    <div className="g9-stage is-dark">
      <div className="g9-viewport g9-loading">
        <div className="g9-loading-inner">
          <span className="g9-loading-dot" />
          <p>Preparing 3D bedroom study…</p>
        </div>
      </div>
    </div>
  ),
});

type HotChoice = {
  id: string;
  focus: string;
  label: string;
  hint: string;
  tag: string;
  score: Partial<Record<MatchKey, number>>;
  why: string;
  insight?: string;
};

type HotStep = {
  chapter: string;
  scene: SceneKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  choices: HotChoice[];
};

const HOT_STEPS: HotStep[] = [
  {
    chapter: "03 · Heat",
    scene: "heat",
    eyebrow: "01 / WHERE YOU NOTICE IT",
    title: "Where do you notice the heat?",
    subtitle: "Not every warm night is a mattress problem. Pick what matches your experience most closely.",
    choices: [
      {
        id: "surface",
        focus: "surface",
        label: "The mattress surface feels warm.",
        hint: "Warmth builds right where your body rests against the bed.",
        tag: "SURFACE",
        score: { ultimate: 5 },
        why: "the mattress surface feels warm where you lie",
        insight: "Cooling-oriented comfort layers are not a guaranteed temperature drop — covers, bedding and room airflow still play a major role.",
      },
      {
        id: "room",
        focus: "room",
        label: "The blanket or room feels warm.",
        hint: "The air or covers around you feel stuffy before the mattress does.",
        tag: "ENVIRONMENT",
        score: {},
        why: "room temperature and bedding may matter more than changing mattresses",
        insight: "When the blanket or room is the main source of warmth, lighter breathable bedding and ventilation often help more than buying a new mattress.",
      },
      {
        id: "enclosed",
        focus: "enclosed",
        label: "I feel too enclosed by my mattress.",
        hint: "You sink in deeply and feel hugged rather than free to move.",
        tag: "CONTOUR",
        score: { regular: 4, pro: 2 },
        why: "you prefer less sink-in and a steadier surface",
        insight: "Deep contouring surrounds more of your body. A firmer, more buoyant surface lets you lie on top rather than inside the foam.",
      },
      {
        id: "unsure",
        focus: "unsure",
        label: "I'm not sure.",
        hint: "Compare sleeping position, feel and materials first.",
        tag: "EXPLORE",
        score: {},
        why: "you want to compare surface feel before paying for upgrades",
        insight: "That's completely fine. We'll weigh your sleeping position, comfort feel and priorities without pushing a cooling upgrade.",
      },
    ],
  },
  {
    chapter: "04 · Position",
    scene: "position",
    eyebrow: "02 / HOW YOU SLEEP",
    title: "Which sleeping position puts you in contact with the bed most?",
    subtitle: "Think about how you usually fall asleep, not how you think you should sleep.",
    choices: [
      { id: "side", focus: "side", label: "On my side", hint: "Shoulders and hips carry most of the contact.", tag: "SIDE", score: { pro: 3, ultimate: 3 }, why: "you mainly sleep on your side" },
      { id: "back", focus: "back", label: "On my back", hint: "Weight spreads evenly across a steadier surface.", tag: "BACK", score: { pro: 3, regular: 2 }, why: "you mainly sleep on your back" },
      { id: "stomach", focus: "stomach", label: "On my stomach", hint: "Prefer less sink around the hips and waist.", tag: "STOMACH", score: { regular: 4, pro: 1 }, why: "you mainly sleep on your stomach" },
      { id: "combo", focus: "combo", label: "I keep changing positions", hint: "Side, back, side again through the night.", tag: "MIXED", score: { pro: 3, ultimate: 1 }, why: "you change positions during the night" },
    ],
  },
  {
    chapter: "04 · Feel",
    scene: "feel",
    eyebrow: "03 / YOUR COMFORT",
    title: "Forget the labels. How should your bed actually feel?",
    subtitle: "Watch how the surface responds conceptually. Softer isn't always better, and firmer isn't always more supportive.",
    choices: [
      { id: "firm", focus: "firm", label: "Steady. I like lying on top", hint: "A firmer surface with restrained give.", tag: "STEADY", score: { regular: 6, pro: 1 }, why: "you prefer a firm, on-top surface" },
      { id: "balanced", focus: "balanced", label: "A little give, with support underneath", hint: "Neither rigid nor overly plush.", tag: "BALANCED", score: { pro: 7 }, why: "you prefer a balanced feel" },
      { id: "plush", focus: "plush", label: "Cushioned. I like a softer hug", hint: "More contouring and plush surface comfort.", tag: "PLUSH", score: { ultimate: 7, pro: 1 }, why: "you enjoy a plush, cushioned feel" },
    ],
  },
  {
    chapter: "04 · Priority",
    scene: "priority",
    eyebrow: "04 / WHAT IS WORTH PAYING FOR",
    title: "What would make this purchase worth it?",
    subtitle: "We're not here to sell you the most expensive mattress. Compare the three builds and pick a sensible fit.",
    choices: [
      { id: "essential", focus: "essential", label: "Get the essentials right", hint: "A straightforward two-foam build at a sensible price.", tag: "REGULAR", score: { regular: 7, pro: 1 }, why: "you value straightforward construction before upgrades" },
      { id: "everyday", focus: "everyday", label: "Get the balance right", hint: "Memory foam comfort and responsive support for everyday use.", tag: "PRO", score: { pro: 7 }, why: "you prioritise balanced everyday comfort" },
      { id: "premium", focus: "premium", label: "Pay more if the materials make sense", hint: "Open to cooling-oriented and adaptive comfort layers.", tag: "ULTIMATE", score: { ultimate: 7 }, why: "you are open to premium comfort layers" },
    ],
  },
];

const POSITION: Record<MatchKey, { tagline: string; angle: string; benefits: string[]; tradeoff: string }> = {
  regular: {
    tagline: "Support. Without the unnecessary extras.",
    angle: "Soft foam on top over a firm high-density foam base. Because you lie on top of the surface rather than sinking deep into memory foam, it suits sleepers who want a steadier feel and sensible spending.",
    benefits: ["High-density foam support base", "Soft PU comfort top", "Less sink-in, easier to move on"],
    tradeoff: "Less contouring around shoulders and hips than memory-foam builds. No dedicated cooling-oriented comfort layer.",
  },
  pro: {
    tagline: "Cushioned where you need it. Supported where it matters.",
    angle: "Memory foam and a soft transition layer over a responsive 32D HR base. If airflow and bounce matter to you, the optional pocket-spring base swaps out the HR core.",
    benefits: ["Memory foam pressure relief", "32D HR responsive support base", "Optional pocket-spring core for added airflow"],
    tradeoff: "Not the firmest or most plush choice. Pocket springs are an optional paid upgrade, not included by default.",
  },
  ultimate: {
    tagline: "More responsive comfort. Temperature in mind.",
    angle: "Cooling-oriented memory foam and adaptive foam over a dense 40D HR base, wrapped in a breathable washable AeroTex cover. Natural latex is available as a top-layer swap for a bouncier, breathable feel.",
    benefits: ["Breathable washable AeroTex cover", "Cooling-oriented memory foam & adaptive foam", "40D HR support base (optional Natural Latex top)"],
    tradeoff: "Higher price and a more plush feel. Cooling-oriented materials do not guarantee a specific temperature drop; room and bedding still matter.",
  },
};

function keyOf(p: Mattress): MatchKey {
  const v = `${p.slug} ${p.name}`.toLowerCase();
  if (v.includes("ultimate")) return "ultimate";
  if (v.includes("regular")) return "regular";
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

export default function HotExperience({ products }: { products: Mattress[] }) {
  const router = useRouter();
  const { addItem, hydrated, count } = useCart();

  // intro = true plays Scene 01 (Recognition) -> Scene 02 (Understanding) while question 01 is already usable
  const [introActive, setIntroActive] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<HotChoice[]>([]);
  const [hoveredFocus, setHoveredFocus] = useState<string | null>(null);

  const [group, setGroup] = useState("Queen");
  const [sizeChoice, setSizeChoice] = useState("");
  const [heightChoice, setHeightChoice] = useState("");
  const [upgrades, setUpgrades] = useState<Record<string, string>>({});
  const [checkingOut, setCheckingOut] = useState(false);

  const finished = step >= HOT_STEPS.length;

  // Deterministic recommendation scoring (exact same engine as SleepQuiz)
  const ranked = useMemo(() => {
    const scores: Record<MatchKey, number> = { regular: 0, pro: 0, ultimate: 0 };
    for (const ans of answers) {
      for (const [k, pts] of Object.entries(ans.score)) {
        scores[k as MatchKey] += pts || 0;
      }
    }
    return [...products].sort((a, b) => scores[keyOf(b)] - scores[keyOf(a)]);
  }, [answers, products]);

  const best = ranked[0];
  const bestKey: MatchKey = best ? keyOf(best) : "pro";
  const roomFirst = answers[0]?.id === "room";

  // Build real catalogue 3D layer stacks (live-updating when upgrades change in Solution!)
  const stacks: StageStack[] = useMemo(() => {
    const order: MatchKey[] = ["regular", "pro", "ultimate"];
    return order.map((k) => {
      const p = products.find((item) => keyOf(item) === k) || products[0];
      const activeLayers =
        p && finished && best && keyOf(p) === bestKey
          ? layersWithChoices(p, upgrades)
          : p?.layers || [];
      return {
        key: k,
        name: p?.name || `Gadda ${k}`,
        layers: activeLayers.map((l) => ({
          name: l.name,
          material: l.material || l.description || "",
          kind: l.visualKind || "auto",
        })),
      };
    });
  }, [products, finished, best, bestKey, upgrades]);

  // Size, thickness, variant & live pricing
  const availableGroups = useMemo(
    () =>
      SIZE_GROUPS.filter((g) =>
        best?.sizes.some(
          (s) =>
            (s as SizeRow).group === g.id ||
            s.label === g.id ||
            s.label.startsWith(`${g.id} `)
        )
      ),
    [best]
  );
  const activeGroup = availableGroups.some((g) => g.id === group)
    ? group
    : availableGroups[0]?.id || "";
  const groupSizes = useMemo(
    () =>
      ((best?.sizes as SizeRow[]) || []).filter(
        (s) =>
          s.group === activeGroup ||
          s.label === activeGroup ||
          s.label.startsWith(`${activeGroup} `)
      ),
    [best, activeGroup]
  );
  const size = groupSizes.some((s) => s.label === sizeChoice)
    ? sizeChoice
    : standardSize(groupSizes, activeGroup);
  const height = best?.heights.some((h) => h.label === heightChoice)
    ? heightChoice
    : best?.heights[0]?.label || "";
  const variant = (best?.options || [])
    .map((o) => {
      const picked = upgrades[o.id];
      return o.choices.find((c) => c.label === picked)?.label || o.choices[0]?.label || "";
    })
    .filter(Boolean)
    .join(" · ");
  const price =
    best && size && height
      ? mattressPrice(best, size, height, variant) ??
        (() => {
          const s = best.sizes.find((v) => v.label === size);
          const h = best.heights.find((v) => v.label === height);
          const extra = (best.options || []).reduce(
            (n, o) =>
              n +
              ((o.choices.find((c) => c.label === upgrades[o.id]) || o.choices[0])?.priceAdd || 0),
            0
          );
          return best.basePrice + (s?.priceAdd || 0) + (h?.priceAdd || 0) + extra;
        })()
      : null;

  useEffect(() => {
    if (finished && best) {
      trackEvent("quiz_complete", { productSlug: best.slug, label: "sleepmatch_v9_hot_3d" });
      trackEvent("quiz_result_view", { productSlug: best.slug, label: best.slug });
    }
  }, [finished, best, answers]);

  const handleStoryComplete = useCallback(() => {
    setIntroActive(false);
  }, []);

  function choose(option: HotChoice) {
    setIntroActive(false);
    setHoveredFocus(null);
    const next = [...answers.slice(0, step), option];
    setAnswers(next);
    if (step === 0) {
      trackEvent("quiz_start", { label: "sleepmatch_v9_hot_3d" });
    }
    trackEvent("quiz_step", { label: String(step + 1) });
    setStep(step + 1);
  }

  function previewChoice(focus: string | null) {
    if (focus) setIntroActive(false);
    setHoveredFocus(focus);
  }

  function reset() {
    setAnswers([]);
    setStep(0);
    setHoveredFocus(null);
    setIntroActive(true);
    setGroup("Queen");
    setSizeChoice("");
    setHeightChoice("");
    setUpgrades({});
    setCheckingOut(false);
  }

  function buyNow() {
    if (!best || !size || !height || price === null || !hydrated || checkingOut) return;
    setCheckingOut(true);
    addItem(
      {
        id: `${best.slug}-${size}-${height}${variant ? `-${variant}` : ""}`,
        slug: best.slug,
        name: best.name,
        image: best.image,
        size,
        height,
        variant: variant || undefined,
        price,
        quantity: 1,
      },
      { open: false }
    );
    trackEvent("quiz_checkout_click", {
      productSlug: best.slug,
      value: price,
      label: `${size} ${height}`,
    });
    router.push("/checkout");
  }

  // Determine active 3D scene & focus
  const activeScene: SceneKey = finished
    ? "solution"
    : introActive && step === 0 && !hoveredFocus
      ? "story"
      : HOT_STEPS[step].scene;

  const activeFocus: string | null = finished
    ? null
    : hoveredFocus || answers[step]?.focus || null;

  const stageProduct: MatchKey = finished
    ? bestKey
    : activeScene === "story"
      ? "ultimate"
      : bestKey;

  const currentQuestion = !finished ? HOT_STEPS[step] : null;
  const fallbackImg = best?.image || "/products/gadda-ultimate/layers.webp";

  return (
    <section className="g9-hot" id="sleepmatch" aria-labelledby="g9-hot-title">
      {/* Minimalist editorial campaign header */}
      <div className="g9-header">
        <div className="g-wrap g9-header-inner">
          <div className="g9-header-copy">
            <p className="g9-kicker">GADDA / THREE MATTRESSES. NO NONSENSE.</p>
            <h1 id="g9-hot-title">Your bed shouldn&apos;t feel like a heater.</h1>
            <p className="g9-lede">
              Before we talk about mattresses, let&apos;s understand where the warmth is coming from —
              the surface, the bedding, or the room itself.
            </p>
          </div>
          <div className="g9-header-meta">
            <SleepMatchPinPrompt />
          </div>
        </div>
      </div>

      {/* Dominant 3D Stage + Interactive Chapter Panel */}
      <div className="g-wrap g9-workspace">
        {/* Chapter rail */}
        <nav className="g9-chapters" aria-label="Story chapters">
          <button
            type="button"
            className={activeScene === "story" ? "is-active" : ""}
            onClick={() => {
              setStep(0);
              setHoveredFocus(null);
              setIntroActive(true);
            }}
          >
            <span>01–02</span> Story &amp; Cutaway
          </button>
          {HOT_STEPS.map((s, idx) => (
            <button
              key={s.eyebrow}
              type="button"
              className={!finished && activeScene !== "story" && step === idx ? "is-active" : answers[idx] ? "is-done" : ""}
              disabled={idx > answers.length}
              onClick={() => {
                setIntroActive(false);
                setHoveredFocus(null);
                setStep(idx);
              }}
            >
              <span>{String(idx + 1).padStart(2, "0")}</span> {s.chapter.replace(/^\d+\s*·\s*/, "")}
            </button>
          ))}
          <button
            type="button"
            className={finished ? "is-active" : ""}
            disabled={!finished}
            onClick={() => setStep(HOT_STEPS.length)}
          >
            <span>05</span> Match
          </button>
        </nav>

        <div className={`g9-grid ${finished ? "is-solution" : ""}`}>
          {/* Dominant 3D Stage */}
          <div className="g9-stage-col">
            <HotStage
              scene={activeScene}
              focus={activeFocus}
              product={stageProduct}
              stacks={stacks}
              roomFirst={roomFirst}
              fallbackImage={fallbackImg}
              fallbackAlt={best ? `${best.name} construction` : "GADDA mattress construction"}
              onStoryComplete={handleStoryComplete}
            />
          </div>

          {/* Interactive Question or Solution Panel */}
          <div className="g9-panel-col" aria-live="polite">
            {currentQuestion ? (
              <div className="g9-question-panel">
                <div className="g9-panel-top">
                  <span className="g9-step-eyebrow">{currentQuestion.eyebrow}</span>
                  <span className="g9-step-counter">
                    {String(step + 1).padStart(2, "0")} / {String(HOT_STEPS.length).padStart(2, "0")}
                  </span>
                </div>

                <div
                  className="g9-progress"
                  role="progressbar"
                  aria-label="Questionnaire progress"
                  aria-valuemin={0}
                  aria-valuemax={HOT_STEPS.length}
                  aria-valuenow={step}
                >
                  <span style={{ width: `${((step + 0.25) / HOT_STEPS.length) * 100}%` }} />
                </div>

                <h2 className="g9-question-title">{currentQuestion.title}</h2>
                <p className="g9-question-sub">{currentQuestion.subtitle}</p>

                {step === 1 && answers[0]?.insight && (
                  <div className="g9-insight">
                    <strong>Honest note</strong>
                    <p>{answers[0].insight}</p>
                  </div>
                )}

                <div className="g9-choices" role="group" aria-label={currentQuestion.title}>
                  {currentQuestion.choices.map((choice) => {
                    const isPicked = answers[step]?.id === choice.id;
                    const isHover = hoveredFocus === choice.focus;
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        className={`g9-choice ${isPicked ? "is-picked" : ""} ${isHover ? "is-preview" : ""}`}
                        onMouseEnter={() => previewChoice(choice.focus)}
                        onMouseLeave={() => previewChoice(null)}
                        onFocus={() => previewChoice(choice.focus)}
                        onBlur={() => previewChoice(null)}
                        onClick={() => choose(choice)}
                      >
                        <span className="g9-choice-tag">{choice.tag}</span>
                        <span className="g9-choice-copy">
                          <strong>{choice.label}</strong>
                          <small>{choice.hint}</small>
                        </span>
                        <span className="g9-choice-arrow" aria-hidden="true">→</span>
                      </button>
                    );
                  })}
                </div>

                <div className="g9-panel-foot">
                  {step > 0 ? (
                    <button
                      type="button"
                      className="g9-link-btn"
                      onClick={() => {
                        setHoveredFocus(null);
                        setStep((s) => Math.max(0, s - 1));
                      }}
                    >
                      ← Back
                    </button>
                  ) : (
                    <span>Answer anytime — no need to wait for the film</span>
                  )}
                  <Link href="/sleep-quiz" className="g9-quiet-href">
                    Different sleep concern →
                  </Link>
                </div>
              </div>
            ) : best ? (
              <div className="g9-solution-panel">
                <div className="g9-panel-top">
                  <span className="g9-step-eyebrow">05 / PERSONALISED MATCH</span>
                  <button type="button" className="g9-link-btn" onClick={reset}>
                    Start over ↺
                  </button>
                </div>

                {roomFirst && (
                  <div className="g9-honest-banner">
                    <strong>Check your room &amp; bedding first</strong>
                    <p>
                      You noted the blanket or room feels warm. Switching to lighter cotton sheets,
                      reducing duvet weight, or improving airflow may help more than replacing your
                      mattress. If you are still shopping for a bed, here is your closest fit based
                      on your feel and position answers:
                    </p>
                  </div>
                )}

                <h2 className="g9-result-name">{best.name}</h2>
                <p className="g9-result-tagline">{POSITION[bestKey].tagline}</p>
                <p className="g9-result-angle">{POSITION[bestKey].angle}</p>

                <div className="g9-facts">
                  <div className="g9-fact-card">
                    <b>Why this matched</b>
                    <ul>
                      {answers
                        .filter((a) => a.why)
                        .map((a) => (
                          <li key={a.id}>{a.why}</li>
                        ))}
                    </ul>
                  </div>
                  <div className="g9-fact-card">
                    <b>Materials &amp; trade-offs</b>
                    <ul>
                      {POSITION[bestKey].benefits.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    <p className="g9-tradeoff">{POSITION[bestKey].tradeoff}</p>
                  </div>
                </div>

                {/* Live configuration & checkout */}
                <div className="g9-config" aria-labelledby="g9-config-title">
                  <div className="g9-config-head">
                    <h3 id="g9-config-title">Configure your {best.name}</h3>
                    <Link href="/size-guide" target="_blank" rel="noopener noreferrer">
                      Measure your bed ↗
                    </Link>
                  </div>

                  <div className="g9-size-groups" role="group" aria-label="Mattress size family">
                    {availableGroups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        className={activeGroup === g.id ? "g9-chip is-active" : "g9-chip"}
                        aria-pressed={activeGroup === g.id}
                        onClick={() => {
                          setGroup(g.id);
                          setSizeChoice("");
                        }}
                      >
                        {g.id}
                      </button>
                    ))}
                  </div>

                  <div className="g9-fields">
                    <label>
                      Exact dimensions
                      <select
                        value={size}
                        onChange={(e) => setSizeChoice(e.target.value)}
                      >
                        {groupSizes.map((s) => (
                          <option key={s.label} value={s.label}>
                            {readableSize(s.label)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Thickness
                      <select
                        value={height}
                        onChange={(e) => setHeightChoice(e.target.value)}
                      >
                        {best.heights.map((h) => (
                          <option key={h.label} value={h.label}>
                            {h.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {(best.options || []).map((opt) => (
                    <label className="g9-upgrade" key={opt.id}>
                      {opt.label} <small>(updates 3D cutaway live)</small>
                      <select
                        value={
                          upgrades[opt.id] &&
                          opt.choices.some((c) => c.label === upgrades[opt.id])
                            ? upgrades[opt.id]
                            : opt.choices[0]?.label || ""
                        }
                        onChange={(e) =>
                          setUpgrades((prev) => ({ ...prev, [opt.id]: e.target.value }))
                        }
                      >
                        {opt.choices.map((c) => (
                          <option key={c.label} value={c.label}>
                            {c.label}
                            {c.priceAdd > 0 ? ` (+${money(c.priceAdd)})` : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}

                  <div className="g9-purchase">
                    <div>
                      <span>Price for your configuration</span>
                      <strong>
                        {size && height && price !== null ? money(price) : "Choose your size"}
                      </strong>
                      <small>GST included · Assam &amp; Meghalaya PIN checked at checkout</small>
                    </div>
                    <button
                      type="button"
                      className="g9-buy-btn"
                      disabled={!size || !height || price === null || !hydrated || checkingOut}
                      onClick={buyNow}
                    >
                      {checkingOut ? "Opening checkout…" : "Continue to checkout ↗"}
                    </button>
                  </div>

                  {count > 0 && (
                    <p className="g9-note">
                      You already have {count} item{count > 1 ? "s" : ""} in your cart. This match
                      will be added alongside it.
                    </p>
                  )}
                  <p className="g9-note">
                    Preference-based recommendation, not a medical assessment or cooling guarantee.{" "}
                    <Link href="/policies/trial">100-night trial terms</Link>.
                  </p>
                </div>

                <SleepMatchLeadCapture
                  product={best.name}
                  concern={answers[0]?.label || "Sleeping hot"}
                  size={size}
                  height={height}
                  price={price ?? 0}
                />

                <div className="g9-result-links">
                  <Link href={`/mattresses/${best.slug}?variant=true`}>
                    Full {best.name} specs &amp; custom sizes →
                  </Link>
                  {ranked[1] && (
                    <Link href={`/mattresses/${ranked[1].slug}`}>
                      Compare with {ranked[1].name} ↗
                    </Link>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

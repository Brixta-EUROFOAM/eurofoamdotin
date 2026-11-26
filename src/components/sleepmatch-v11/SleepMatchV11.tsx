"use client";
/*
  GADDA V12 — Premium Infographic Questionnaire for all 5 ad campaigns
  (hot, cold, tired, restless, stiff).
  - Simple editorial layout: one dominant curated infographic + one clear question
  - Image-based answer cards on Position, Feel and Priority steps
  - Remotion reserved for subtle masked image reveals, kinetic captions & product reveals
  - Preserves existing recommendation scoring, live pricing, cart, Razorpay checkout,
    PIN verification, Brevo lead capture & analytics.
*/
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import SleepMatchLeadCapture from "@/components/store/SleepMatchLeadCapture";
import SleepMatchPinPrompt from "@/components/store/SleepMatchPinPrompt";
import { layersWithChoices, money, type Mattress } from "@/lib/catalog";
import { mattressPrice } from "@/lib/mattress-pricing";
import { SIZE_GROUPS, type SizeRow } from "@/lib/sizes";
import { trackEvent } from "@/lib/telemetry-client";
import {
  CAMPAIGNS,
  PRODUCT_POSITIONING,
  STEP_INFOGRAPHICS,
  stepsForCampaign,
  type CampaignKey,
  type MatchKey,
  type QuizOption,
} from "./campaigns";
import { StagePlayer } from "./StagePlayer";
import type { StageLayerInfo } from "./StageComposition";

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

export default function SleepMatchV11({
  products,
  campaign,
}: {
  products: Mattress[];
  campaign: CampaignKey;
}) {
  const router = useRouter();
  const { addItem, hydrated, count } = useCart();

  const cfg = CAMPAIGNS[campaign];
  const steps = useMemo(() => stepsForCampaign(campaign), [campaign]);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizOption[]>([]);
  const [previewOption, setPreviewOption] = useState<QuizOption | null>(null);

  // Configuration state on result screen
  const [group, setGroup] = useState("Queen");
  const [sizeChoice, setSizeChoice] = useState("");
  const [heightChoice, setHeightChoice] = useState("");
  const [upgrades, setUpgrades] = useState<Record<string, string>>({});
  const [checkingOut, setCheckingOut] = useState(false);

  const finished = step >= steps.length;
  const currentStep = !finished ? steps[step] : null;

  // Deterministic existing scoring engine (no fake percentages, no forced upsell)
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
  const positioning = PRODUCT_POSITIONING[bestKey];

  const startingPrices = useMemo<Record<MatchKey, string>>(() => {
    const out: Record<MatchKey, string> = { regular: "₹6,990", pro: "₹11,990", ultimate: "₹18,990" };
    for (const p of products) {
      out[keyOf(p)] = money(p.basePrice);
    }
    return out;
  }, [products]);

  const activeLayers = useMemo<StageLayerInfo[]>(() => {
    if (!best) return [];
    const list = finished ? layersWithChoices(best, upgrades) : best.layers;
    return list.map((l) => ({
      name: l.name,
      material: l.material || l.description || "",
      kind: l.visualKind || "auto",
    }));
  }, [best, finished, upgrades]);

  // Live size, thickness, variant & real pricing
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

  // Swap studio cutaway photo live if user picks Pocket Springs (Pro) or Natural Latex (Ultimate)
  const upgradePhoto = useMemo(() => {
    if (!finished || !positioning.photos.layersUpgrade || !positioning.photos.upgradeMatch) {
      return undefined;
    }
    return variant.toLowerCase().includes(positioning.photos.upgradeMatch)
      ? positioning.photos.layersUpgrade
      : undefined;
  }, [finished, positioning, variant]);

  const nonMattressNote = answers[0]?.nonMattressNote;

  useEffect(() => {
    if (finished && best) {
      trackEvent("quiz_complete", { productSlug: best.slug, label: `sleepmatch_v12_${campaign}` });
      trackEvent("quiz_result_view", { productSlug: best.slug, label: best.slug });
    }
  }, [finished, best, campaign, answers]);

  function choose(opt: QuizOption) {
    setPreviewOption(null);
    const next = [...answers.slice(0, step), opt];
    setAnswers(next);
    if (step === 0) {
      trackEvent("quiz_start", { label: `sleepmatch_v12_${campaign}` });
    }
    trackEvent("quiz_step", { label: String(step + 1) });
    setStep(step + 1);
  }

  function reset() {
    setAnswers([]);
    setStep(0);
    setPreviewOption(null);
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

  const activeOption = previewOption || answers[step] || null;
  const activeFocus = activeOption?.focus || null;
  const stepKind = finished ? "result" : currentStep!.kind;

  // Resolve the dominant static editorial infographic & captions for the current step
  const stageMeta = useMemo(() => {
    if (stepKind === "concern") {
      return {
        eyebrow: cfg.stageEyebrow,
        badge: cfg.stageBadge,
        imageSrc: cfg.infographic,
        imageAlt: cfg.infographicAlt,
        caption: activeOption?.stageCaption || cfg.stageDefaultCaption,
        footerRight: cfg.stageFooterRight,
      };
    }
    if (stepKind === "position") {
      const m = STEP_INFOGRAPHICS.position;
      return {
        eyebrow: m.eyebrow,
        badge: m.badge,
        imageSrc: m.src,
        imageAlt: m.alt,
        caption: activeOption?.stageCaption || m.defaultCaption,
        footerRight: m.footerRight,
      };
    }
    if (stepKind === "feel") {
      const m = STEP_INFOGRAPHICS.feel;
      return {
        eyebrow: m.eyebrow,
        badge: m.badge,
        imageSrc: m.src,
        imageAlt: m.alt,
        caption: activeOption?.stageCaption || m.defaultCaption,
        footerRight: m.footerRight,
      };
    }
    if (stepKind === "priority") {
      return {
        eyebrow: "04 / THREE MATTRESSES. NO NONSENSE.",
        badge: "COMPARE THE RANGE",
        imageSrc: positioning.photos.layers,
        imageAlt: "GADDA mattress constructions comparison",
        caption:
          activeOption?.stageCaption ||
          "All three GADDA builds list real foam densities and honest trade-offs.",
        footerRight: "Verified starting prices",
      };
    }
    return {
      eyebrow: "GADDA / YOUR SHORTLIST",
      badge: nonMattressNote ? "COMFORT PREFERENCE FIT" : "PERSONALISED MATCH",
      imageSrc: positioning.photos.layers,
      imageAlt: `${best?.name || positioning.name} mattress cutaway construction`,
      caption: positioning.tagline,
      footerRight: "Real GADDA photography",
    };
  }, [stepKind, cfg, activeOption, positioning, best, nonMattressNote]);

  const hasThumbnails = Boolean(currentStep?.choices.some((c) => c.thumbnail));

  return (
    <section
      className="sm11-section"
      id="sleepmatch"
      aria-labelledby="sm11-headline"
      style={{ ["--sm11-tint" as string]: cfg.accentBg }}
    >
      {/* Editorial campaign opener */}
      <div className="sm11-hero">
        <div className="g-wrap sm11-hero-grid">
          <div>
            <p className="sm11-kicker">{cfg.kicker}</p>
            <h1 id="sm11-headline">{cfg.headline}</h1>
            <p className="sm11-intro">{cfg.intro}</p>
          </div>
          <div className="sm11-hero-pin">
            <SleepMatchPinPrompt />
          </div>
        </div>
      </div>

      {/* Main two-column editorial infographic stage + questionnaire */}
      <div className="g-wrap sm11-workspace">
        <nav className="sm11-stepper" aria-label="Questionnaire steps">
          {steps.map((s, idx) => {
            const isCurrent = !finished && step === idx;
            const isDone = idx < answers.length;
            return (
              <button
                key={s.eyebrow}
                type="button"
                className={`sm11-step-pill ${isCurrent ? "is-current" : ""} ${isDone ? "is-done" : ""}`}
                disabled={idx > answers.length}
                onClick={() => {
                  setPreviewOption(null);
                  setStep(idx);
                }}
              >
                <span>{String(idx + 1).padStart(2, "0")}</span>
                {s.kind === "concern"
                  ? "Your concern"
                  : s.kind === "position"
                    ? "Position"
                    : s.kind === "feel"
                      ? "Feel"
                      : "Priority"}
              </button>
            );
          })}
          <button
            type="button"
            className={`sm11-step-pill ${finished ? "is-current" : ""}`}
            disabled={!finished}
            onClick={() => setStep(steps.length)}
          >
            <span>05</span>Your match
          </button>
        </nav>

        <div className="sm11-grid">
          {/* Left: Single Dominant Curated Infographic Stage */}
          <div className="sm11-stage-col">
            <StagePlayer
              campaign={campaign}
              stepKind={stepKind}
              focus={activeFocus}
              eyebrow={stageMeta.eyebrow}
              badge={stageMeta.badge}
              imageSrc={stageMeta.imageSrc}
              imageAlt={stageMeta.imageAlt}
              caption={stageMeta.caption}
              footerRight={stageMeta.footerRight}
              productKey={bestKey}
              productName={best?.name || positioning.name}
              productTagline={positioning.tagline}
              productLayers={activeLayers}
              upgradePhoto={upgradePhoto}
              startingPrices={startingPrices}
              nonMattressFlag={Boolean(nonMattressNote)}
            />
          </div>

          {/* Right: Clear Question + Editorial / Image-Based Answer Cards */}
          <div className="sm11-panel-col" aria-live="polite">
            {currentStep ? (
              <div className="sm11-question">
                <div className="sm11-meta-row">
                  <span className="sm11-eyebrow">{currentStep.eyebrow}</span>
                  <span className="sm11-count">
                    {String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                  </span>
                </div>

                <div
                  className="sm11-progress"
                  role="progressbar"
                  aria-label="Quiz progress"
                  aria-valuemin={0}
                  aria-valuemax={steps.length}
                  aria-valuenow={step}
                >
                  <span style={{ width: `${((step + 0.25) / steps.length) * 100}%` }} />
                </div>

                <h2 className="sm11-q-title">{currentStep.title}</h2>
                <p className="sm11-q-sub">{currentStep.subtitle}</p>

                {step === 1 && answers[0]?.insight && (
                  <div className="sm11-note-callout">
                    <strong>Note from your last answer</strong>
                    <p>{answers[0].insight}</p>
                  </div>
                )}

                <div
                  className={`sm11-options ${hasThumbnails ? "has-thumbs" : ""}`}
                  role="group"
                  aria-label={currentStep.title}
                >
                  {currentStep.choices.map((opt) => {
                    const isSelected = answers[step]?.id === opt.id;
                    const isPreview = previewOption?.id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`sm11-option ${opt.thumbnail ? "is-visual" : ""} ${isSelected ? "is-selected" : ""} ${isPreview ? "is-preview" : ""}`}
                        onMouseEnter={() => setPreviewOption(opt)}
                        onMouseLeave={() => setPreviewOption(null)}
                        onFocus={() => setPreviewOption(opt)}
                        onBlur={() => setPreviewOption(null)}
                        onClick={() => choose(opt)}
                      >
                        {opt.thumbnail ? (
                          <span className={`sm11-opt-thumb fit-${opt.thumbnailFit || "cover"}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={opt.thumbnail} alt={opt.thumbnailAlt || opt.label} />
                          </span>
                        ) : (
                          <span className="sm11-opt-tag">{opt.tag}</span>
                        )}
                        <span className="sm11-opt-copy">
                          {opt.thumbnail && <em className="sm11-opt-mini-tag">{opt.tag}</em>}
                          <strong>{opt.label}</strong>
                          <small>{opt.hint}</small>
                        </span>
                        <span className="sm11-opt-mark" aria-hidden="true">
                          {isSelected ? "✓" : "→"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="sm11-why-ask">
                  <b>Why we ask:</b> {currentStep.whyItMatters}
                </p>

                <div className="sm11-foot">
                  {step > 0 ? (
                    <button
                      type="button"
                      className="sm11-text-btn"
                      onClick={() => {
                        setPreviewOption(null);
                        setStep((s) => Math.max(0, s - 1));
                      }}
                    >
                      ← Back
                    </button>
                  ) : (
                    <span>No account or email required</span>
                  )}
                  <Link href="/sleep-quiz" className="sm11-switch-link">
                    Different sleep concern →
                  </Link>
                </div>
              </div>
            ) : best ? (
              <div className="sm11-result">
                <div className="sm11-meta-row">
                  <span className="sm11-eyebrow">05 / PERSONALISED MATCH</span>
                  <button type="button" className="sm11-text-btn" onClick={reset}>
                    Start over ↺
                  </button>
                </div>

                {nonMattressNote && (
                  <div className="sm11-honest-callout">
                    <strong>{nonMattressNote.heading}</strong>
                    <p>{nonMattressNote.body}</p>
                  </div>
                )}

                <h2 className="sm11-result-name">{best.name}</h2>
                <p className="sm11-result-tag">{positioning.tagline}</p>
                <p className="sm11-result-summary">{positioning.summary}</p>

                <div className="sm11-result-blocks">
                  <div>
                    <h3>Based on your answers</h3>
                    <ul>
                      {answers
                        .filter((a) => a.why)
                        .map((a) => (
                          <li key={a.id}>{a.why}</li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Materials &amp; honest trade-offs</h3>
                    <ul>
                      {positioning.benefits.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    <p className="sm11-tradeoff">
                      <b>Trade-off:</b> {positioning.tradeoff}
                    </p>
                  </div>
                </div>

                {/* Live configuration, pricing & checkout */}
                <div className="sm11-config" aria-labelledby="sm11-config-title">
                  <div className="sm11-config-head">
                    <h3 id="sm11-config-title">Configure your {best.name}</h3>
                    <Link href="/size-guide" target="_blank" rel="noopener noreferrer">
                      Measure your bed ↗
                    </Link>
                  </div>

                  <div className="sm11-size-chips" role="group" aria-label="Mattress size family">
                    {availableGroups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        className={activeGroup === g.id ? "sm11-chip is-active" : "sm11-chip"}
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

                  <div className="sm11-select-grid">
                    <label>
                      Exact dimensions
                      <select value={size} onChange={(e) => setSizeChoice(e.target.value)}>
                        {groupSizes.map((s) => (
                          <option key={s.label} value={s.label}>
                            {readableSize(s.label)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Thickness
                      <select value={height} onChange={(e) => setHeightChoice(e.target.value)}>
                        {best.heights.map((h) => (
                          <option key={h.label} value={h.label}>
                            {h.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {(best.options || []).map((opt) => (
                    <label className="sm11-upgrade-select" key={opt.id}>
                      {opt.label} <small>(updates layer reveal)</small>
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

                  <div className="sm11-buy-bar">
                    <div>
                      <span>Price for your configuration</span>
                      <strong>
                        {size && height && price !== null ? money(price) : "Choose your size"}
                      </strong>
                      <small>GST included · Assam &amp; Meghalaya PIN checked at checkout</small>
                    </div>
                    <button
                      type="button"
                      className="sm11-buy-cta"
                      disabled={!size || !height || price === null || !hydrated || checkingOut}
                      onClick={buyNow}
                    >
                      {checkingOut ? "Opening checkout…" : "Continue to checkout ↗"}
                    </button>
                  </div>

                  {count > 0 && (
                    <p className="sm11-fine">
                      You already have {count} item{count > 1 ? "s" : ""} in your cart. This match
                      will be added alongside it.
                    </p>
                  )}
                  <p className="sm11-fine">
                    Preference-based recommendation, not a medical diagnosis or performance
                    guarantee. <Link href="/policies/trial">100-night trial terms</Link>.
                  </p>
                </div>

                <SleepMatchLeadCapture
                  product={best.name}
                  concern={`${campaign}: ${answers[0]?.label || cfg.headline}`}
                  size={size}
                  height={height}
                  price={price ?? 0}
                />

                <div className="sm11-result-links">
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

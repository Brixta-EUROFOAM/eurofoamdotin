"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductVisual from "@/components/store/ProductVisual";
import { useCart } from "@/components/CartProvider";
import { money, type Mattress } from "@/lib/catalog";
import { trackEvent } from "@/lib/telemetry-client";

type Key = "regular" | "pro" | "ultimate";
type Option = { label: string; hint: string; score: Partial<Record<Key, number>>; why?: string };
type Question = { title: string; body: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    title: "How do you usually fall asleep?",
    body: "Your sleeping position decides how much give you need at the shoulders and hips.",
    options: [
      { label: "On my side", hint: "Shoulders and hips need to sink in a little", score: { pro: 3, ultimate: 3 }, why: "side sleepers need some give at the shoulder" },
      { label: "On my back", hint: "Even support along the spine", score: { pro: 3, regular: 2 }, why: "back sleepers do best with even, steady support" },
      { label: "On my stomach", hint: "Less sink so the hips don't dip", score: { regular: 3, pro: 2 }, why: "stomach sleepers need a firmer surface so the hips don't dip" },
      { label: "All over the place", hint: "I turn a lot through the night", score: { pro: 3, regular: 1 }, why: "a balanced surface is easier to move on" },
    ],
  },
  {
    title: "Which feel do you like?",
    body: "Think of a bed you slept really well on — a hotel, a relative's house.",
    options: [
      { label: "Firm", hint: "Like a good cotton gadda: you lie on it, not in it", score: { regular: 4, pro: 1 }, why: "you like it firm" },
      { label: "In between", hint: "Supportive, with a soft top", score: { pro: 4 }, why: "you want firm support with a softer top" },
      { label: "Plush", hint: "Sink in a little, feel held", score: { ultimate: 4, pro: 1 }, why: "you like a plush, sink-in feel" },
    ],
  },
  {
    title: "Who else is in the bed?",
    body: "Sharing changes how much movement you feel.",
    options: [
      { label: "Just me", hint: "", score: { regular: 1 } },
      { label: "My partner", hint: "Less disturbance when they turn", score: { pro: 2, ultimate: 2 }, why: "memory foam soaks up a partner's movement" },
      { label: "Partner plus kids or pets", hint: "Busy bed", score: { pro: 2, ultimate: 1 }, why: "a busy bed needs a tough support base" },
    ],
  },
  {
    title: "Do you wake up feeling hot?",
    body: "Foam can hold heat; some layers handle it better.",
    options: [
      { label: "Often", hint: "Fan on full, still warm", score: { ultimate: 3 }, why: "the Ultimate's natural latex top breathes and doesn't trap heat" },
      { label: "Sometimes", hint: "In summer", score: { pro: 1, ultimate: 1 } },
      { label: "Not really", hint: "", score: { regular: 1, pro: 1 } },
    ],
  },
  {
    title: "What matters most on price?",
    body: "All three are built properly. The difference is in the comfort layers.",
    options: [
      { label: "Best value", hint: "Good sleep, sensible spend", score: { regular: 5 }, why: "you want the best value" },
      { label: "Middle of the range", hint: "Pay for what makes a difference", score: { pro: 4 } },
      { label: "The best one", hint: "Every upgrade", score: { ultimate: 5 }, why: "you want every comfort upgrade" },
    ],
  },
];

function keyOf(p: Mattress): Key {
  const s = `${p.slug} ${p.name}`.toLowerCase();
  if (s.includes("ultimate")) return "ultimate";
  if (s.includes("regular")) return "regular";
  return "pro";
}

export default function SleepQuiz({ products }: { products: Mattress[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const { addItem } = useCart();
  const done = step >= QUESTIONS.length;

  const result = useMemo(() => {
    const score: Record<Key, number> = { regular: 0, pro: 0, ultimate: 0 };
    for (const a of answers) for (const [k, v] of Object.entries(a.score)) score[k as Key] += v || 0;
    const ranked = [...products].sort((a, b) => score[keyOf(b)] - score[keyOf(a)]);
    const reasons = answers.map((a) => a.why).filter(Boolean) as string[];
    return { best: ranked[0], runner: ranked[1], reasons: reasons.slice(0, 3) };
  }, [answers, products]);

  useEffect(() => {
    if (done && result.best) trackEvent("quiz_complete", { productSlug: result.best.slug, label: result.best.slug });
  }, [done, result.best]);

  function choose(o: Option) {
    setAnswers((a) => [...a.slice(0, step), o]);
    setStep((s) => s + 1);
  }

  if (done && result.best) {
    const p = result.best;
    const firstSize = p.sizes[Math.min(2, p.sizes.length - 1)];
    return (
      <div className="g-quiz" aria-live="polite">
        <div className="g-card-flat" style={{ display: "grid", gap: 20 }}>
          <span className="g-chip g-chip--orange" style={{ justifySelf: "start" }}>
            Your match
          </span>
          <h2 className="g-h2">{p.name}</h2>
          <div className="g-quiz-visual">
            <ProductVisual image={p.image} layers={p.layers} alt={p.name} />
          </div>
          <p className="g-lede" style={{ margin: 0 }}>
            {result.reasons.length
              ? `Because ${result.reasons.join(", and ")}.`
              : p.shortDescription}
          </p>
          <p style={{ margin: 0 }}>
            <b>{money(p.basePrice)}</b> for a {p.sizes[0]?.label} {p.heights[0]?.label}. Delivery included.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link href={`/mattresses/${p.slug}`} className="g-btn g-btn--orange">
              See the {p.name}
            </Link>
            {firstSize ? (
              <button
                type="button"
                className="g-btn g-btn--ghost"
                onClick={() =>
                  addItem({
                    id: `${p.slug}-${firstSize.label}-${p.heights[0].label}${p.options?.length ? `-${p.options.map((o) => o.choices[0].label).join(" · ")}` : ""}`,
                    slug: p.slug,
                    name: p.name,
                    image: p.image,
                    size: firstSize.label,
                    height: p.heights[0].label,
                    variant: p.options?.length ? p.options.map((o) => o.choices[0].label).join(" · ") : undefined,
                    price: p.basePrice + firstSize.priceAdd + p.heights[0].priceAdd,
                    quantity: 1,
                  })
                }
              >
                Add {firstSize.label} {p.heights[0].label} to cart
              </button>
            ) : null}
          </div>
          {result.runner ? (
            <p style={{ margin: 0, color: "var(--g-ink-2)" }}>
              Close second: <Link href={`/mattresses/${result.runner.slug}`} className="g-link">{result.runner.name}</Link>. Still unsure?
              The 100-night trial means you can&apos;t really get this wrong.
            </p>
          ) : null}
          <button
            type="button"
            className="g-link"
            style={{ justifySelf: "start" }}
            onClick={() => {
              setAnswers([]);
              setStep(0);
            }}
          >
            Start again
          </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];
  return (
    <div className="g-quiz">
      <div
        className="g-quiz-progress"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={QUESTIONS.length}
        aria-valuenow={step + 1}
        aria-label={`Question ${step + 1} of ${QUESTIONS.length}`}
      >
        <span style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
      </div>
      <p style={{ margin: "0 0 8px", color: "var(--g-ink-3)", fontWeight: 600 }}>
        Question {step + 1} of {QUESTIONS.length}
      </p>
      <h2 className="g-h2">{q.title}</h2>
      <p className="g-lede">{q.body}</p>
      <div className="g-quiz-options" role="radiogroup" aria-label={q.title}>
        {q.options.map((o) => (
          <button
            key={o.label}
            type="button"
            role="radio"
            aria-checked={answers[step]?.label === o.label}
            className="g-choice"
            onClick={() => choose(o)}
          >
            <b>{o.label}</b>
            {o.hint ? <small>{o.hint}</small> : null}
          </button>
        ))}
      </div>
      {step > 0 ? (
        <button type="button" className="g-link" style={{ marginTop: 20 }} onClick={() => setStep((s) => s - 1)}>
          Back
        </button>
      ) : null}
    </div>
  );
}

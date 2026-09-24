"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Mattress } from "@/lib/catalog";
import { money } from "@/lib/catalog";

type MatchKey = "ortho" | "cooling" | "hybrid" | "essential";

type QuizOption = {
  label: string;
  hint: string;
  score: Partial<Record<MatchKey, number>>;
};

type QuizQuestion = {
  eyebrow: string;
  title: string;
  body: string;
  options: QuizOption[];
};

const questions: QuizQuestion[] = [
  {
    eyebrow: "01 / SLEEP STYLE",
    title: "How do you spend most of the night?",
    body: "This helps us decide whether stability or easier movement deserves more weight.",
    options: [
      { label: "Mostly on my side", hint: "Pressure relief without feeling swallowed.", score: { cooling: 1, hybrid: 1 } },
      { label: "Mostly on my back", hint: "A steady, supported feel.", score: { ortho: 3 } },
      { label: "Mostly on my stomach", hint: "Less sink and more stability.", score: { ortho: 3, essential: 1 } },
      { label: "I move around", hint: "I do not stay in one position for long.", score: { hybrid: 3 } },
    ],
  },
  {
    eyebrow: "02 / TEMPERATURE",
    title: "How much does heat bother you?",
    body: "If sleeping warm is a real problem, it should influence the choice instead of becoming a footnote.",
    options: [
      { label: "A lot", hint: "I regularly wake up feeling too warm.", score: { cooling: 4 } },
      { label: "Sometimes", hint: "Cooling matters, but it is not the whole decision.", score: { cooling: 2, hybrid: 1 } },
      { label: "Not really", hint: "Temperature is not high on my list.", score: { ortho: 1, essential: 1 } },
    ],
  },
  {
    eyebrow: "03 / FEEL",
    title: "Which description sounds more like your bed?",
    body: "Forget marketing names. Pick the physical feel you would rather live with.",
    options: [
      { label: "Firm and stable", hint: "Less sink. More structure.", score: { ortho: 4, essential: 1 } },
      { label: "Balanced", hint: "Supportive, but not board-like.", score: { ortho: 2, cooling: 1, hybrid: 1 } },
      { label: "Responsive and buoyant", hint: "I want movement to feel easier.", score: { hybrid: 4 } },
    ],
  },
  {
    eyebrow: "04 / PRIORITY",
    title: "If you could solve one thing, what would it be?",
    body: "This answer carries the most weight in the match.",
    options: [
      { label: "Steady back support", hint: "A structured everyday mattress.", score: { ortho: 6 } },
      { label: "Sleeping cooler", hint: "Heat is the thing I want to reduce.", score: { cooling: 6 } },
      { label: "Movement and partner disturbance", hint: "Response and separation matter most.", score: { hybrid: 6 } },
      { label: "Keeping the spend sensible", hint: "The essentials done properly.", score: { essential: 6 } },
    ],
  },
];

function categoryKey(product: Mattress): MatchKey {
  const value = `${product.category} ${product.kicker} ${product.name}`.toLowerCase();
  if (value.includes("cool") || value.includes("air")) return "cooling";
  if (value.includes("hybrid") || value.includes("float") || value.includes("spring")) return "hybrid";
  if (value.includes("essential") || value.includes("easy") || value.includes("basic")) return "essential";
  return "ortho";
}

function matchReason(key: MatchKey, answers: QuizOption[]) {
  const priority = answers[answers.length - 1]?.label || "Your priority";
  if (key === "cooling") return `Cooling came out strongest in your answers. ${priority} pushed the match toward the cooling job.`;
  if (key === "hybrid") return `Your answers leaned toward easier movement and a more responsive feel. ${priority} pushed the match toward the hybrid job.`;
  if (key === "essential") return `You put more weight on a straightforward mattress and sensible spend. ${priority} made the essential build the cleanest starting point.`;
  return `Your answers leaned toward a steadier, more structured feel. ${priority} made everyday support the clearest starting point.`;
}

export default function SleepQuiz({ products }: { products: Mattress[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizOption[]>([]);
  const done = step >= questions.length;

  const ranked = useMemo(() => {
    if (!products.length) return [];

    const score: Record<MatchKey, number> = {
      ortho: 0,
      cooling: 0,
      hybrid: 0,
      essential: 0,
    };

    answers.forEach((answer) => {
      Object.entries(answer.score).forEach(([key, value]) => {
        score[key as MatchKey] += value || 0;
      });
    });

    return [...products]
      .map((product, index) => ({
        product,
        key: categoryKey(product),
        score: score[categoryKey(product)] - index * 0.001,
      }))
      .sort((a, b) => b.score - a.score);
  }, [answers, products]);

  const recommendation = ranked[0] || null;
  const alternative = ranked[1] || null;

  if (!products.length) {
    return (
      <div className="site-quiz-card site-quiz-card-empty">
        <p className="site-quiz-count">NOTHING TO MATCH YET</p>
        <h2>No Gaddas are configured.</h2>
      </div>
    );
  }

  if (done && recommendation) {
    return (
      <div className="site-quiz-card site-quiz-result">
        <div className="site-quiz-result-meta">
          <span>YOUR STARTING POINT</span>
          <span>{answers.length} / {questions.length} ANSWERED</span>
        </div>

        <div className="site-quiz-result-grid">
          <div className="site-quiz-result-media">
            <img src={recommendation.product.image} alt={recommendation.product.name} />
            <span>{recommendation.product.badge || recommendation.product.category}</span>
          </div>

          <div className="site-quiz-result-copy">
            <p className="site-orange">MATCHED TO THE JOB</p>
            <h2>{recommendation.product.name}</h2>
            <p className="site-quiz-result-reason">{matchReason(recommendation.key, answers)}</p>

            <div className="site-quiz-result-facts">
              <div><small>STARTS AT</small><strong>{money(recommendation.product.basePrice)}</strong></div>
              <div><small>FEEL</small><strong>{recommendation.product.firmness}</strong></div>
              <div><small>TRIAL</small><strong>{recommendation.product.trial}</strong></div>
              <div><small>WARRANTY</small><strong>{recommendation.product.warranty}</strong></div>
            </div>

            <div className="site-quiz-result-rating">
              <strong>★ {recommendation.product.rating}</strong>
              <span>{recommendation.product.reviews.toLocaleString("en-IN")} reviews</span>
            </div>

            <div className="site-quiz-actions">
              <Link href={`/mattresses/${recommendation.product.slug}`} className="site-quiz-primary">SEE THIS GADDA →</Link>
              <Link href="/compare" className="site-quiz-secondary">COMPARE THE RANGE</Link>
              <button type="button" onClick={() => { setStep(0); setAnswers([]); }}>START AGAIN</button>
            </div>

            {alternative ? (
              <div className="site-quiz-alternative">
                <span>ALSO WORTH A LOOK</span>
                <Link href={`/mattresses/${alternative.product.slug}`}>{alternative.product.name} →</Link>
              </div>
            ) : null}

            <small className="site-quiz-disclaimer">
              This is a shopping aid based on your answers, not a medical or sleep-health recommendation.
            </small>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[step];
  const progress = Math.round((step / questions.length) * 100);

  return (
    <div className="site-quiz-card">
      <div className="site-quiz-progress-head">
        <span>{question.eyebrow}</span>
        <span>{progress}% COMPLETE</span>
      </div>

      <div className="site-quiz-progress"><i style={{ width: `${progress}%` }} /></div>

      <div className="site-quiz-question">
        <h2>{question.title}</h2>
        <p>{question.body}</p>
      </div>

      <div className="site-quiz-options">
        {question.options.map((option, index) => (
          <button
            type="button"
            key={option.label}
            onClick={() => {
              setAnswers((current) => [...current, option]);
              setStep((current) => current + 1);
            }}
          >
            <span className="site-quiz-option-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="site-quiz-option-copy">
              <strong>{option.label}</strong>
              <small>{option.hint}</small>
            </span>
            <b>→</b>
          </button>
        ))}
      </div>

      <div className="site-quiz-card-foot">
        <span>No answer locks you in.</span>
        {step > 0 ? (
          <button
            type="button"
            onClick={() => {
              setStep((current) => Math.max(0, current - 1));
              setAnswers((current) => current.slice(0, -1));
            }}
          >
            ← BACK
          </button>
        ) : (
          <Link href="/mattresses">SKIP TO ALL GADDAS →</Link>
        )}
      </div>
    </div>
  );
}

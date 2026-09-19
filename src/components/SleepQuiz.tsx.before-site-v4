"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Mattress } from "@/lib/catalog";

const questions = [
  {
    title: "How do you usually sleep?",
    options: ["Side", "Back", "Stomach", "I move around"]
  },
  {
    title: "Do you sleep hot?",
    options: ["Very much", "Sometimes", "Not really"]
  },
  {
    title: "Which feel sounds best?",
    options: ["Firm & stable", "Balanced", "Soft & buoyant"]
  },
  {
    title: "What matters most?",
    options: ["Back support", "Cooling", "Partner movement", "Price"]
  }
];

export default function SleepQuiz({ products }: { products: Mattress[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const done = step >= questions.length;

  const recommendation = useMemo(() => {
    if (!products.length) return null;

    const joined = answers.join(" ").toLowerCase();
    const byCategory = (category: string) =>
      products.find((product) =>
        product.category.toLowerCase().includes(category.toLowerCase())
      );

    if (joined.includes("cooling") || joined.includes("very much")) {
      return byCategory("cool") || products[0];
    }
    if (joined.includes("partner") || joined.includes("buoyant")) {
      return byCategory("hybrid") || products[0];
    }
    if (joined.includes("price")) {
      return byCategory("essential") || products[products.length - 1] || products[0];
    }
    return byCategory("ortho") || products[0];
  }, [answers, products]);

  if (!products.length) {
    return <div className="rounded-[2rem] bg-white p-8">No products configured yet.</div>;
  }

  if (done && recommendation) {
    return (
      <div className="rounded-[2.5rem] bg-white p-7 shadow-xl sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-dark">
          Your starting point
        </p>
        <h2 className="mt-4 font-display text-5xl">{recommendation.name}</h2>
        <p className="mt-5 max-w-xl text-base leading-7 text-ink/60">
          {recommendation.shortDescription} This quiz is a shopping aid, not a
          medical recommendation.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href={`/mattresses/${recommendation.slug}`}
            className="rounded-full bg-gold px-6 py-4 text-sm font-black text-ink"
          >
            VIEW {recommendation.name.toUpperCase()}
          </Link>
          <button
            onClick={() => {
              setStep(0);
              setAnswers([]);
            }}
            className="rounded-full border border-ink/15 px-6 py-4 text-sm font-black"
          >
            RETAKE
          </button>
        </div>
      </div>
    );
  }

  const question = questions[step];

  return (
    <div className="rounded-[2.5rem] bg-white p-7 shadow-xl sm:p-10">
      <div className="flex items-center justify-between text-xs font-black text-ink/45">
        <span>QUESTION {step + 1} / {questions.length}</span>
        <span>{Math.round((step / questions.length) * 100)}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-sand">
        <div
          className="h-full rounded-full bg-gold transition-all"
          style={{ width: `${(step / questions.length) * 100}%` }}
        />
      </div>
      <h2 className="mt-8 font-display text-4xl sm:text-5xl">{question.title}</h2>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => {
              setAnswers((current) => [...current, option]);
              setStep((current) => current + 1);
            }}
            className="rounded-[1.25rem] border border-ink/10 bg-sand px-5 py-5 text-left font-bold transition hover:border-gold-dark hover:bg-white"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

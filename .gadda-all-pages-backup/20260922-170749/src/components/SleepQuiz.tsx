"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Mattress } from "@/lib/catalog";

const questions = [
  {
    title: "How do you usually sleep?",
    options: ["Side", "Back", "Stomach", "I move around"],
  },
  {
    title: "Do you sleep hot?",
    options: ["Very much", "Sometimes", "Not really"],
  },
  {
    title: "Which feel sounds best?",
    options: ["Firm & stable", "Balanced", "Soft & buoyant"],
  },
  {
    title: "What matters most?",
    options: ["Back support", "Cooling", "Partner movement", "Price"],
  },
];

export default function SleepQuiz({
  products,
}: {
  products: Mattress[];
}) {

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
    return (
      <div className="site-quiz-card">
        No products configured yet.
      </div>
    );
  }


  if (done && recommendation) {

    return (
      <div className="site-quiz-card site-quiz-result">

        <p className="site-quiz-count">
          YOUR STARTING POINT
        </p>

        <h2>
          {recommendation.name}
        </h2>

        <p>
          {recommendation.shortDescription}
        </p>

        <small>
          This is a shopping aid, not a medical recommendation.
        </small>

        <div className="site-quiz-actions">

          <Link href={`/mattresses/${recommendation.slug}`}>
            SEE THIS GADDA →
          </Link>

          <button
            onClick={() => {
              setStep(0);
              setAnswers([]);
            }}
          >
            START AGAIN
          </button>

        </div>

      </div>
    );
  }


  const question = questions[step];

  return (
    <div className="site-quiz-card">

      <div className="site-quiz-progress-head">
        <span>
          QUESTION {step + 1} / {questions.length}
        </span>

        <span>
          {Math.round((step / questions.length) * 100)}%
        </span>
      </div>

      <div className="site-quiz-progress">
        <i
          style={{
            width: `${(step / questions.length) * 100}%`,
          }}
        />
      </div>

      <h2>
        {question.title}
      </h2>

      <div className="site-quiz-options">

        {question.options.map((option, index) => (

          <button
            key={option}
            onClick={() => {
              setAnswers((current) => [...current, option]);
              setStep((current) => current + 1);
            }}
          >
            <span>
              {String(index + 1).padStart(2, "0")}
            </span>

            <strong>
              {option}
            </strong>
          </button>

        ))}

      </div>

    </div>
  );
}

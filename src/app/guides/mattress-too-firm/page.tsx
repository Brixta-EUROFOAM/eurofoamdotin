import type { Metadata } from "next";
import ProblemGuide from "@/components/store/ProblemGuide";
export const metadata: Metadata = {
  title: "Mattress Too Firm? What to Check",
  description: "Why mattresses can feel too hard, how sleep position changes comfort, and what to compare before buying a replacement.",
  alternates: { canonical: "/guides/mattress-too-firm" },
};
export default function Page() {
  return <ProblemGuide
    problem="firm"
    eyebrow="Pressure and firmness"
    title="Mattress too firm? Don't guess your next one."
    summary="A surface that feels supportive for one person can put uncomfortable pressure on another person's shoulders or hips. Identify the mismatch before replacing the mattress."
    explain={[
      { heading: "Separate firmness from support", text: "Firmness is how hard or soft the top surface feels. Support is how the mattress holds you up. A mattress can feel softer at the surface while retaining a more supportive core." },
      { heading: "Check your sleeping position", text: "Side sleepers often prefer more contouring around shoulders and hips than stomach sleepers. Body build, personal feel preference and the support underneath the mattress also matter." },
      { heading: "Look beyond marketing labels", text: "Ask for the actual comfort layer, support base, thickness, and an explanation of the trial exclusions. 'Orthopaedic' or 'premium' alone cannot tell you whether a model suits you." },
    ]}
    recommendation={{ name: "GADDA Pro", href: "/mattresses/gadda-pro", reason: "Its memory-foam comfort layer and 32D high-resilience support base are designed to combine surface contouring with underlying support. A pocket-spring configuration is optional." }}
    faqs={[
      { question: "Does a hard mattress automatically help back pain?", answer: "No single firmness works for everyone, and a mattress is not a treatment for a medical condition. Consider your sleeping position and individual needs; seek professional advice for persistent pain." },
      { question: "Should I buy the softest mattress?", answer: "Not necessarily. Too much sink can also feel uncomfortable. Compare the top comfort layers with the underlying support core instead of buying purely by a soft or firm label." },
    ]}
  />;
}

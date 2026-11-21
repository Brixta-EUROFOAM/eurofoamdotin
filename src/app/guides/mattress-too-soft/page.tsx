import type { Metadata } from "next";
import ProblemGuide from "@/components/store/ProblemGuide";
export const metadata: Metadata = {
  title: "Mattress Too Soft or Sinking? What to Check",
  description: "Understand sinking versus support, bed-base issues, and how to find a firmer mattress without overpaying.",
  alternates: { canonical: "/guides/mattress-too-soft" },
};
export default function Page() {
  return <ProblemGuide
    eyebrow="Sinking and support"
    title="Mattress feels too soft or sinks? Find out why."
    summary="Feeling stuck in a mattress is not always solved by buying the most expensive bed. Start with the mattress, the foundation and the kind of surface you prefer."
    explain={[
      { heading: "Check whether your bed base is the problem", text: "An uneven foundation or damaged slats can make a good mattress feel less supportive. Inspect the base and measure visible dips before assuming the foam itself is at fault." },
      { heading: "Tell plush comfort from excessive sink", text: "A comfortable top layer can compress while the support core still keeps you level. A persistent body impression or excessive sink is different and may justify a warranty inspection." },
      { heading: "Decide whether you actually like a firmer feel", text: "If you dislike deep contouring, compare simpler firm-feeling constructions, the foam-density information available, and the trial conditions. Verify the correct thickness and bed measurements." },
    ]}
    recommendation={{ name: "GADDA Regular", href: "/mattresses/gadda-regular", reason: "The simpler soft-foam-over-HD-foam construction has a firmer, steadier feel at the lowest starting price in GADDA's current range." }}
    faqs={[
      { question: "Can a mattress topper fix sagging?", answer: "A topper can change surface feel but generally cannot restore a damaged or insufficiently supported core. Check the foundation and warranty first." },
      { question: "Is denser foam always firmer?", answer: "No. Foam density and perceived firmness are different properties. Ask for both the intended feel and construction details rather than assuming density alone predicts comfort." },
    ]}
  />;
}

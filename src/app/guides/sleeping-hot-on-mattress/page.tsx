import type { Metadata } from "next";
import ProblemGuide from "@/components/store/ProblemGuide";
export const metadata: Metadata = {
  title: "Sleeping Hot on a Mattress? Cooling Foam Guide",
  description: "Understand how bedding, temperature, mattress materials and airflow can affect sleep warmth before selecting a cooling mattress.",
  alternates: { canonical: "/guides/sleeping-hot-on-mattress" },
};
export default function Page() {
  return <ProblemGuide
    problem="hot"
    eyebrow="Heat and comfort"
    title="Sleeping hot on your mattress? Check the whole setup."
    summary="Heat buildup can involve bedding, room conditions, the mattress cover and the material itself. There is no single mattress that stays cool for every sleeper."
    explain={[
      { heading: "Start with your bedroom conditions", text: "Check room ventilation, humidity, sheets and protector materials. A thick impermeable protector can change the feel of airflow around the mattress." },
      { heading: "Ask what the cooling claim means", text: "Cooling can mean surface-touch sensation, airflow, moisture handling or heat dissipation. These are not interchangeable claims. Look for test data before trusting degree-based temperature promises." },
      { heading: "Choose both your temperature preference and surface feel", text: "A cool-feeling mattress can still be too plush or too firm for a particular person. Match your support preference alongside your concern about warmth." },
    ]}
    recommendation={{ name: "GADDA Ultimate", href: "/mattresses/gadda-ultimate", reason: "Its current catalogue uses a cooling-memory-foam top layer, an adaptive layer and a 40D HR base, with an optional natural-latex top. Independently verified comparative cooling data are not currently published, so treat performance as an individual preference rather than a guarantee." }}
    faqs={[
      { question: "Does cooling foam always reduce night sweating?", answer: "No. Temperature and sweating have multiple possible causes, including room conditions and bedding. Mattress-material claims alone cannot guarantee cooler sleep or treat a health condition." },
      { question: "Is latex cooler than memory foam?", answer: "Temperature performance depends on the complete design, ventilation and cover. Compare actual specifications or tests rather than assuming one material category wins every time." },
    ]}
  />;
}

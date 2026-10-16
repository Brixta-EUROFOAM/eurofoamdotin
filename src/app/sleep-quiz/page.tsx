import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SleepQuiz from "@/components/SleepQuiz";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find my match — 60-second mattress quiz",
  description: "Five quick questions about how you sleep. We'll point you to one GADDA mattress, and tell you why.",
  alternates: { canonical: "/sleep-quiz" },
};

export default async function SleepQuizPage() {
  const { products } = await getStoreData();
  return (
    <>
      <Header />
      <main id="main">
        <section className="g-section" style={{ background: "var(--g-cream)", minHeight: "70vh" }}>
          <div className="g-wrap">
            <SleepQuiz products={products} />
            <p className="g-note" style={{ marginTop: 40 }}>
              A shortlist, not a medical opinion. If you have a back condition, ask your doctor what they recommend.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

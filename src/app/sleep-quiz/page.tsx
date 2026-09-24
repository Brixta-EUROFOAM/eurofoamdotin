import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SleepQuiz from "@/components/SleepQuiz";
import SiteCommerceEndcap from "@/components/SiteCommerceEndcap";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SleepQuizPage() {
  const { products } = await getStoreData();

  return (
    <>
      <Header />

      <main className="site-quiz-page site-public-v2">
        <section className="site-quiz-intro">
          <div className="site-page-meta site-page-meta-dark">
            <span>FIND MY MATCH</span>
            <span>04 QUESTIONS · ABOUT 60 SECONDS</span>
          </div>

          <div className="site-quiz-intro-grid">
            <div>
              <p className="site-orange">
                NOT A SLEEP DIAGNOSIS.<br />
                JUST A BETTER SHORTLIST.
              </p>

              <h1>
                FOUR<br />
                QUESTIONS.<br />
                <em>ONE SENSIBLE START.</em>
              </h1>
            </div>

            <div className="site-quiz-intro-side">
              <p>
                Tell us what you care about when you sleep.
                We&apos;ll map that to the job each Gadda is actually built to do.
              </p>

              <div className="site-quiz-principles">
                <div><span>01</span><strong>NO FAKE PRECISION</strong></div>
                <div><span>02</span><strong>NO MEDICAL CLAIMS</strong></div>
                <div><span>03</span><strong>YOU CAN STILL COMPARE</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="site-quiz-workbench">
          <div className="site-quiz-workbench-copy">
            <p className="site-orange">YOUR SIDE OF THE BED</p>
            <h2>ANSWER LIKE<br />A HUMAN.</h2>
            <p>
              There are no perfect answers here. Pick the option closest to how you actually sleep.
            </p>
          </div>

          <div className="site-quiz-machine">
            <SleepQuiz products={products} />
          </div>
        </section>

        <SiteCommerceEndcap
          eyebrow="WANT TO IGNORE THE QUIZ?"
          title="FAIR. SEE ALL THE GADDAS."
        />
      </main>

      <Footer />
    </>
  );
}

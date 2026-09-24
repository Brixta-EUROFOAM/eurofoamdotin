import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SleepQuiz from "@/components/SleepQuiz";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SleepQuizPage() {

  const { products } = await getStoreData();

  return (
    <>
      <Header />

      <main className="site-quiz-page">

        <section className="site-quiz-intro">

          <p className="site-orange">
            STILL DON&apos;T KNOW?
          </p>

          <h1>
            FINE.
            <br />
            WE&apos;LL
            <br />
            NARROW IT
            <br />
            DOWN.
          </h1>

          <p>
            Four simple questions.
            No sleep diagnosis.
            No fake precision.
            Just a sensible place to start.
          </p>

          <div className="site-quiz-note">
            TAKES LESS TIME
            <br />
            THAN READING
            <br />
            ONE MATTRESS AD.
          </div>

        </section>

        <div className="site-quiz-machine">
          <SleepQuiz products={products} />
        </div>

      </main>

      <Footer />
    </>
  );
}

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
      <main className="bg-gold-light">
        <section className="mx-auto grid min-h-[75vh] max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[.75fr_1.25fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-dark">
              Mattress matcher
            </p>
            <h1 className="mt-4 font-display text-6xl leading-[0.9] sm:text-7xl">
              Find your starting point.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-ink/60">
              Four quick questions mapped to the product catalogue maintained
              from the admin panel.
            </p>
          </div>
          <SleepQuiz products={products} />
        </section>
      </main>
      <Footer />
    </>
  );
}

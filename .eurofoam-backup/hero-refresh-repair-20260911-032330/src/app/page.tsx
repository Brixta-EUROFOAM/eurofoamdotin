import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import PromoBanners from "@/components/home/PromoBanners";
import ShopByRooms from "@/components/home/ShopByRooms";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
import LayerScrollStory from "@/components/home/LayerScrollStory";
import CinematicHomeHero from "@/components/CinematicHomeHero";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { site, products, reviews } = await getStoreData();


  const promises = [
    ["100", "NIGHT TRIAL", "Live with selected models before you commit."],
    ["10+", "YEAR WARRANTY", "Long-term coverage on core models."],
    ["₹0", "STANDARD SHIPPING", "Direct to your doorstep."],
    [String(products.length), "MATTRESS TYPES", "A focused range with clear differences."]
  ];

  return (
    <>
      <Header />
      <main>
        <CinematicHomeHero
          site={site}
          products={products}
        />

<section className="border-y border-ink/10 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
            {promises.map(([number, title, text]) => (
              <div
                key={title}
                className="border-ink/10 p-6 even:border-l lg:border-l lg:first:border-l-0"
              >
                <div className="font-display text-4xl text-gold-dark">{number}</div>
                <div className="mt-1 text-xs font-black tracking-[0.12em]">{title}</div>
                <p className="mt-2 text-xs leading-5 text-ink/50">{text}</p>
              </div>
            ))}
          </div>
        </section>


        <LayerScrollStory />

        <NewArrivalsSection products={products} />

        <ShopByRooms products={products} />

        <PromoBanners />

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-dark">
                Pick your sleep feel
              </p>
              <h2 className="mt-3 max-w-2xl font-display text-5xl sm:text-6xl">
                Fewer mattresses. Clearer choices.
              </h2>
            </div>
            <Link href="/compare" className="text-sm font-black underline underline-offset-4">
              COMPARE ALL →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {products.map((mattress) => (
              <ProductCard key={mattress.slug} mattress={mattress} />
            ))}
          </div>
        </section>


        <section className="bg-gold-light">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-dark">
                Not sure where to start?
              </p>
              <h2 className="mt-4 font-display text-5xl sm:text-6xl">
                Take the 60-second sleep quiz.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-ink/65">
                Sleep position, heat sensitivity, feel preference and budget.
                Four questions, one practical starting point.
              </p>
              <Link
                href="/sleep-quiz"
                className="mt-7 inline-flex rounded-full bg-ink px-6 py-4 text-sm font-black text-white"
              >
                START THE QUIZ →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["SIDE", "BACK", "HOT", "COUPLE"].map((word, i) => (
                <div
                  key={word}
                  className={`flex aspect-square items-end rounded-[2rem] p-6 ${
                    ["bg-white", "bg-sky", "bg-sage", "bg-lilac"][i]
                  }`}
                >
                  <span className="font-display text-3xl">{word}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {reviews.length ? (
          <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-dark">
                Customer proof
              </p>
              <h2 className="mt-4 font-display text-5xl sm:text-6xl">
                What sleepers say.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {reviews.slice(0, 3).map((review) => (
                <blockquote
                  key={review.id}
                  className="rounded-[2rem] border border-ink/10 bg-white p-7"
                >
                  <div className="text-gold-dark">
                    {"★".repeat(Math.max(1, Math.min(5, review.stars)))}
                  </div>
                  <p className="mt-5 text-lg leading-8">“{review.quote}”</p>
                  <footer className="mt-6 border-t border-ink/10 pt-4 text-sm">
                    <strong>{review.name}</strong>
                    <div className="mt-1 text-ink/45">{review.product}</div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import HomeMattressExperience from "@/components/HomeMattressExperience";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { site, products, reviews } = await getStoreData();
  const homeStoryProduct =
    products.find(
      (product) =>
        product.slug === site.homeStoryProductSlug
    ) || products[0];


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
        <section className="overflow-hidden bg-[#FFFFFF]">
          <div className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-gold-light px-4 py-2">
                <span className="text-xs font-black tracking-[0.15em] text-ink">
                  {site.heroEyebrow}
                </span>
              </div>

              <h1 className="mt-7 max-w-3xl font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.87] text-ink">
                {site.heroTitle}
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-ink/65">
                {site.heroBody}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/mattresses"
                  className="rounded-full bg-gold px-7 py-4 text-sm font-black text-ink shadow-lg shadow-gold/20 transition hover:bg-gold-light"
                >
                  {site.primaryCtaLabel}
                </Link>
                <Link
                  href="/sleep-quiz"
                  className="rounded-full border border-ink/15 bg-white px-7 py-4 text-sm font-black text-ink"
                >
                  {site.secondaryCtaLabel} →
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <img
                  src={site.logoUrl}
                  alt={site.brandName}
                  className="h-16 w-auto max-w-[210px] object-contain"
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-butter blur-2xl" />
              <div className="absolute -bottom-6 -right-6 h-48 w-48 rounded-full bg-gold-light blur-2xl" />
              <div className="relative overflow-hidden rounded-[3rem] bg-ink p-3 shadow-2xl">
                <img
                  src={site.heroImage}
                  alt="Eurofoam bedroom"
                  className="aspect-[4/5] w-full rounded-[2.4rem] object-cover md:aspect-[5/4] lg:aspect-[4/5]"
                />
                {products[0] ? (
                  <div className="absolute bottom-7 left-7 right-7 rounded-[1.5rem] bg-white/92 p-5 backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
                          Start here
                        </p>
                        <p className="mt-1 font-display text-2xl">{products[0].name}</p>
                      </div>
                      <Link
                        href={`/mattresses/${products[0].slug}`}
                        className="rounded-full bg-ink px-4 py-3 text-xs font-black text-white"
                      >
                        VIEW
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

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

        {homeStoryProduct ? (
          <HomeMattressExperience
            mattress={homeStoryProduct}
          />
        ) : null}

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

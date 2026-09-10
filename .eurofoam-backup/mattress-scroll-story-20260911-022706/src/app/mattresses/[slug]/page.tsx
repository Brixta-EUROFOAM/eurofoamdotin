import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductBuyBox from "@/components/ProductBuyBox";
import ProductCard from "@/components/ProductCard";
import { getProduct, getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MattressPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mattress = await getProduct(slug);
  if (!mattress) notFound();

  const { products } = await getStoreData();
  const related = products.filter((item) => item.slug !== mattress.slug).slice(0, 2);

  return (
    <>
      <Header />
      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-16">
          <div className={`rounded-[2.5rem] bg-linear-to-br ${mattress.accent} p-4 lg:sticky lg:top-32 lg:self-start`}>
            <img
              src={mattress.image}
              alt={mattress.name}
              className="aspect-square w-full rounded-[2rem] object-cover"
            />
          </div>
          <ProductBuyBox mattress={mattress} />
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-dark">
                  Inside the mattress
                </p>
                <h2 className="mt-4 font-display text-5xl">
                  Every layer has a job.
                </h2>
                <p className="mt-5 text-sm leading-7 text-ink/60">
                  Use the admin panel to replace these descriptions with real
                  foam density, ILD, spring gauge, fabric GSM and certifications.
                </p>
              </div>

              <div className="space-y-3">
                {mattress.layers.map((layer, index) => (
                  <div
                    key={`${layer.name}-${index}`}
                    className={`rounded-[1.4rem] border border-ink/10 p-5 ${
                      ["bg-gold-light", "bg-sky", "bg-lilac", "bg-sage"][index % 4]
                    }`}
                  >
                    <div className="flex gap-5">
                      <div className="font-display text-3xl text-ink/35">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h3 className="font-display text-2xl">{layer.name}</h3>
                        <p className="mt-1 text-sm leading-6 text-ink/60">
                          {layer.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <h2 className="font-display text-5xl">What it is designed to do</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mattress.features.map((feature, index) => (
              <div key={`${feature}-${index}`} className="rounded-[1.5rem] border border-ink/10 bg-white p-5">
                <div className="text-sm font-black text-gold-dark">0{index + 1}</div>
                <p className="mt-5 font-bold leading-6">{feature}</p>
              </div>
            ))}
          </div>
        </section>

        {related.length ? (
          <section className="bg-ink">
            <div className="mx-auto max-w-7xl px-5 py-20 text-white lg:px-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">
                Still comparing?
              </p>
              <h2 className="mt-4 font-display text-5xl">Other directions.</h2>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {related.map((item) => (
                  <ProductCard key={item.slug} mattress={item} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}

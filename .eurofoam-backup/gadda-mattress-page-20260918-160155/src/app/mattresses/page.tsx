import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MattressesPage() {
  const { products } = await getStoreData();

  return (
    <>
      <Header />
      <main>
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">
              Shop mattresses
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-6xl leading-[0.9] sm:text-8xl">
              Choose by feel, support and construction.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              Pick a model, then configure size and height on the product page.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="grid gap-6 md:grid-cols-2">
            {products.map((mattress) => (
              <ProductCard key={mattress.slug} mattress={mattress} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

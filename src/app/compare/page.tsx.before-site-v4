import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { money } from "@/lib/catalog";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const { products } = await getStoreData();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-dark">
          Side-by-side
        </p>
        <h1 className="mt-4 font-display text-6xl sm:text-8xl">Compare mattresses.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/60">
          Price, feel, trial, warranty and core positioning in one place.
        </p>

        <div className="mt-10 overflow-x-auto rounded-[2rem] border border-ink/10 bg-white">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-sand">
                <th className="p-5">Model</th>
                {products.map((m) => (
                  <th key={m.slug} className="p-5">
                    <div className="font-display text-2xl">{m.name}</div>
                    <div className="mt-1 text-xs text-gold-dark">{m.category}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Starting price", (m: typeof products[number]) => money(m.basePrice)],
                ["Firmness", (m: typeof products[number]) => m.firmness],
                ["Trial", (m: typeof products[number]) => m.trial],
                ["Warranty", (m: typeof products[number]) => m.warranty],
                ["Best for", (m: typeof products[number]) => m.kicker],
                ["Core feature", (m: typeof products[number]) => m.features[0] || "—"]
              ].map(([label, fn]) => {
                const render = fn as (m: typeof products[number]) => string;
                return (
                  <tr key={String(label)} className="border-b border-ink/10 last:border-0">
                    <th className="p-5 font-black">{String(label)}</th>
                    {products.map((m) => (
                      <td key={m.slug} className="p-5 text-ink/65">
                        {render(m)}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr>
                <th className="p-5">Shop</th>
                {products.map((m) => (
                  <td key={m.slug} className="p-5">
                    <Link
                      href={`/mattresses/${m.slug}`}
                      className="inline-flex rounded-full bg-ink px-4 py-2 text-xs font-black text-white"
                    >
                      VIEW
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}

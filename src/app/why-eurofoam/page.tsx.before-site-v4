import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function WhyEurofoam() {
  const { site } = await getStoreData();

  const pillars = [
    ["01", "Focused range", "A compact catalogue makes the differences between mattresses easier to understand."],
    ["02", "Transparent construction", "Explain materials and the job each layer is intended to perform."],
    ["03", "At-home buying", "Let customers evaluate the mattress in the environment that matters: their bedroom."],
    ["04", "Direct feedback", "D2C reviews, returns and support conversations can feed directly into product iteration."]
  ];

  return (
    <>
      <Header />
      <main>
        <section className="bg-ink text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1fr_.55fr] lg:px-8 lg:py-28">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">
                Why {site.brandName}
              </p>
              <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[0.9] sm:text-8xl">
                {site.tagline}.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/60">
                This page is ready for the actual Eurofoam factory story,
                material expertise, certifications, test data, founders and
                manufacturing advantages.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white p-6">
              <img
                src={site.logoUrl}
                alt={site.brandName}
                className="w-full object-contain"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="grid gap-5 md:grid-cols-2">
            {pillars.map(([n, title, body], index) => (
              <div
                key={n}
                className={`rounded-[2rem] p-7 ${
                  ["bg-gold-light", "bg-sky", "bg-lilac", "bg-sage"][index]
                }`}
              >
                <div className="font-display text-5xl text-ink/25">{n}</div>
                <h2 className="mt-8 font-display text-4xl">{title}</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-ink/60">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

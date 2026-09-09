import Link from "next/link";
import { getStoreData } from "@/lib/store";

export default async function Footer() {
  const { site } = await getStoreData();

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="inline-flex rounded-xl bg-white p-3">
            <img
              src={site.logoUrl}
              alt={site.brandName}
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
            {site.tagline}. Direct-to-consumer mattress shopping with clear
            product differences, configurable sizes and an at-home buying journey.
          </p>
          <div className="mt-5 text-sm text-white/55">
            <div>{site.email}</div>
            <div className="mt-1">{site.phone}</div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Shop
          </h3>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <Link className="block hover:text-white" href="/mattresses">Mattresses</Link>
            <Link className="block hover:text-white" href="/compare">Compare</Link>
            <Link className="block hover:text-white" href="/sleep-quiz">Sleep Quiz</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Brand
          </h3>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <Link className="block hover:text-white" href="/why-eurofoam">Why Eurofoam</Link>
            <Link className="block hover:text-white" href="/reviews">Reviews</Link>
            <Link className="block hover:text-white" href="/admin">Admin</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-6 text-center text-xs text-white/45">
        © {new Date().getFullYear()} {site.brandName} {site.brandSuffix}.
      </div>
    </footer>
  );
}

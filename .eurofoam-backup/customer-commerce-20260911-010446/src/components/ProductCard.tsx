import Link from "next/link";
import type { Mattress } from "@/lib/catalog";
import { money } from "@/lib/catalog";

export default function ProductCard({ mattress }: { mattress: Mattress }) {
  const discount = Math.round(
    ((mattress.compareAt - mattress.basePrice) / mattress.compareAt) * 100
  );

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-[0_12px_40px_rgba(22,29,35,0.06)]">
      <Link href={`/mattresses/${mattress.slug}`} className="block">
        <div className={`relative bg-linear-to-br ${mattress.accent} p-3`}>
          <img
            src={mattress.image}
            alt={mattress.name}
            className="aspect-[4/3] w-full rounded-[1.5rem] object-cover transition duration-500 group-hover:scale-[1.02]"
          />
          {mattress.badge ? (
            <span className="absolute left-6 top-6 rounded-full bg-ink px-3 py-1.5 text-[10px] font-black tracking-[0.15em] text-white">
              {mattress.badge}
            </span>
          ) : null}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-dark">
                {mattress.kicker}
              </p>
              <h3 className="mt-2 font-display text-3xl text-ink">
                {mattress.name}
              </h3>
            </div>
            <div className="whitespace-nowrap text-sm font-bold">
              ★ {mattress.rating}
            </div>
          </div>

          <p className="mt-4 min-h-12 text-sm leading-6 text-ink/60">
            {mattress.shortDescription}
          </p>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-ink/45 line-through">
                {money(mattress.compareAt)}
              </div>
              <div className="text-xl font-black text-ink">
                {money(mattress.basePrice)}
              </div>
            </div>
            <span className="rounded-full bg-gold-light px-3 py-2 text-xs font-black text-ink">
              {discount}% OFF
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

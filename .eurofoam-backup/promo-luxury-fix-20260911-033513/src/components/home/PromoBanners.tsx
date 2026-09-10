import Link from "next/link";

export default function PromoBanners() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#2B1A11_0%,#4A2A15_45%,#FF7A00_100%)] text-white shadow-[0_18px_50px_rgba(63,24,0,0.22)]">
            <div className="grid items-center gap-8 px-7 py-8 md:grid-cols-[1.05fr_.95fr] md:px-10 md:py-10">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                  Find your match
                </p>
                <h3 className="mt-3 font-display text-4xl leading-[0.95] sm:text-5xl">
                  Not sure which mattress fits you?
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/78 sm:text-base">
                  Guide people into the right comfort profile instead of throwing
                  every product at them at once.
                </p>
                <Link
                  href="/sleep-quiz"
                  className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-black text-ink"
                >
                  Find my mattress →
                </Link>
              </div>

              <div className="relative min-h-[180px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/10 backdrop-blur">
                <div className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute left-8 top-8 rounded-full border border-white/25 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/85">
                  100 nights · warranty · delivery
                </div>
                <div className="absolute left-8 bottom-8 right-8 text-3xl font-display leading-tight text-white/95">
                  Better sleep, explained properly.
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-ink/8 bg-[linear-gradient(90deg,#FFF3E7_0%,#F9E8D8_48%,#F4D4B5_100%)] shadow-[0_16px_36px_rgba(0,0,0,0.05)]">
            <div className="grid items-center gap-8 px-7 py-8 md:grid-cols-[0.95fr_1.05fr] md:px-10">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D95F0E]">
                  Eurofoam value
                </p>
                <h3 className="mt-3 font-display text-4xl leading-[0.95] text-ink sm:text-5xl">
                  Direct comfort. Cleaner decisions.
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-ink/65 sm:text-base">
                  Use these strips like controlled merchandising zones, not loud
                  discount chaos.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["100", "Night trial"],
                  ["10+", "Year warranty"],
                  ["₹0", "Shipping"]
                ].map(([num, label]) => (
                  <div
                    key={label}
                    className="rounded-[1.4rem] border border-white/40 bg-white/70 p-5 text-center backdrop-blur"
                  >
                    <div className="font-display text-4xl text-[#C56A15]">{num}</div>
                    <div className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-ink/65">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

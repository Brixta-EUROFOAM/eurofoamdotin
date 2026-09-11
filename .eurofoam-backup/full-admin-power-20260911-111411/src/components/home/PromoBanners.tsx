import Link from "next/link";

type Product = {
  slug: string;
  name: string;
  image: string;
  heroImage?: string;
  gallery?: string[];
};

function getImage(product?: Product) {
  if (!product) return "";
  return product.heroImage || product.gallery?.[0] || product.image || "";
}

export default function PromoBanners({
  products
}: {
  products: Product[];
}) {
  const finderProduct = products?.[0];
  const spotlightProduct = products?.[1] || products?.[0];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[10px] border border-black/8 bg-[#F9F8F6]">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex items-center px-7 py-10 sm:px-10 lg:px-12 lg:py-14">
                <div className="max-w-[34rem]">
                  <p className="text-[11px] font-semibold tracking-[0.34em] text-[#8B7B68]">
                    FIND YOUR MATCH
                  </p>

                  <h3 className="mt-5 text-[clamp(2.6rem,5vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.05em] text-[#111111]">
                    Choose by feel,
                    <br />
                    not by guesswork.
                  </h3>

                  <p className="mt-6 max-w-xl text-[15px] leading-7 text-black/62 sm:text-base">
                    Side sleeper, back sleeper, lighter frame or deeper support —
                    start with how you sleep and narrow the range to what will
                    actually feel right at home.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href="/sleep-quiz"
                      className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black"
                    >
                      Find my mattress
                      <span aria-hidden="true">→</span>
                    </Link>

                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/46">
                      100 nights · warranty · delivery
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={finderProduct?.slug ? `/mattresses/${finderProduct.slug}` : "/mattresses"}
                className="group relative min-h-[320px] overflow-hidden border-t border-black/8 lg:min-h-[420px] lg:border-l lg:border-t-0"
              >
                <img
                  src={getImage(finderProduct) || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop"}
                  alt={finderProduct?.name || "Eurofoam mattress"}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                />

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,12,12,0.72)_0%,rgba(12,12,12,0.28)_42%,rgba(12,12,12,0.16)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.14),transparent_26%)]" />

                <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8 lg:p-10">
                  <div className="max-w-[24rem]">
                    <p className="text-[11px] font-semibold tracking-[0.32em] text-white/64">
                      EUROFOAM EDIT
                    </p>

                    <div className="mt-3 text-[clamp(2rem,3vw,3rem)] font-medium leading-[0.98] tracking-[-0.045em] text-white">
                      Better sleep,
                      <br />
                      explained clearly.
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/72">
                      Materials, support profile and comfort feel — shown in a way
                      that is easy to compare.
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
                      Explore mattresses
                      <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[10px] border border-black/8 bg-[#F9F8F6]">
            <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
              <div className="px-7 py-10 sm:px-10 lg:px-12 lg:py-12">
                <p className="text-[11px] font-semibold tracking-[0.34em] text-[#8B7B68]">
                  EUROFOAM VALUE
                </p>

                <h3 className="mt-5 text-[clamp(2.4rem,4.5vw,4.3rem)] font-medium leading-[0.95] tracking-[-0.05em] text-[#111111]">
                  Direct comfort.
                  <br />
                  Clearer decisions.
                </h3>

                <p className="mt-6 max-w-xl text-[15px] leading-7 text-black/62 sm:text-base">
                  Good support should not need showroom theatre. We build around
                  comfort, clean construction and a simpler path from selection to delivery.
                </p>

                <Link
                  href={spotlightProduct?.slug ? `/mattresses/${spotlightProduct.slug}` : "/mattresses"}
                  className="mt-8 inline-flex items-center gap-2 border-b border-black/70 pb-2 text-sm font-semibold text-[#111111] transition hover:gap-3"
                >
                  Explore our mattresses
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="border-t border-black/8 px-7 py-7 lg:border-l lg:border-t-0 lg:px-10 lg:py-10">
                <div className="grid gap-0 overflow-hidden rounded-[8px] border border-black/8 sm:grid-cols-3">
                  {[
                    ["100", "Night Trial", "Sleep on it at home before deciding."],
                    ["10+", "Year Warranty", "Built to hold shape and support."],
                    ["Free", "Shipping", "Delivered directly to your door."]
                  ].map(([value, label, body], index) => (
                    <div
                      key={label}
                      className={`bg-white px-6 py-7 ${
                        index !== 2 ? "border-b border-black/8 sm:border-b-0 sm:border-r" : ""
                      }`}
                    >
                      <div className="text-4xl font-medium tracking-[-0.04em] text-[#111111]">
                        {value}
                      </div>
                      <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-black/66">
                        {label}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-black/54">
                        {body}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 overflow-hidden rounded-[8px] border border-black/8 bg-white">
                  <Link
                    href={spotlightProduct?.slug ? `/mattresses/${spotlightProduct.slug}` : "/mattresses"}
                    className="grid items-center sm:grid-cols-[0.95fr_1.05fr]"
                  >
                    <div className="px-6 py-7">
                      <p className="text-[11px] font-semibold tracking-[0.32em] text-[#8B7B68]">
                        FEATURED
                      </p>
                      <h4 className="mt-4 text-3xl font-medium leading-[1] tracking-[-0.04em] text-[#111111]">
                        {spotlightProduct?.name || "Eurofoam collection"}
                      </h4>
                      <p className="mt-4 max-w-md text-sm leading-6 text-black/58">
                        A balanced feel with composed support and a cleaner visual finish.
                      </p>
                    </div>

                    <div className="relative min-h-[220px] border-t border-black/8 sm:min-h-[250px] sm:border-l sm:border-t-0">
                      <img
                        src={getImage(spotlightProduct) || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop"}
                        alt={spotlightProduct?.name || "Eurofoam mattress"}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(249,248,246,0.04)_0%,rgba(249,248,246,0.02)_40%,rgba(0,0,0,0.08)_100%)]" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

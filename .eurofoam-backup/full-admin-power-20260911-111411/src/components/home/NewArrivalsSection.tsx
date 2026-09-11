import Link from "next/link";

function getPrice(product: any) {
  return (
    product?.price ??
    product?.salePrice ??
    product?.priceFrom ??
    product?.startingPrice ??
    product?.mrp ??
    null
  );
}

function formatPrice(value: any) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  }

  return String(value);
}

export default function NewArrivalsSection({
  products
}: {
  products: any[];
}) {
  const items = products.slice(0, 8);

  return (
    <section className="bg-[#F6EFE8]">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D95F0E]">
              New arrivals
            </p>
            <h2 className="mt-3 font-display text-5xl leading-[0.92] sm:text-6xl">
              Fresh picks for the home.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ink/60">
              A merchandised section inspired by large-format retail browsing,
              but kept cleaner and calmer for Eurofoam.
            </p>
          </div>

          <Link
            href="/mattresses"
            className="inline-flex rounded-full border border-ink/12 bg-white px-6 py-3 text-sm font-black text-ink"
          >
            View all
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {["Mattresses", "Pillows", "Protectors", "Accessories"].map((item, index) => (
            <button
              key={item}
              type="button"
              className={`rounded-full px-5 py-3 text-sm font-black transition ${
                index === 0
                  ? "bg-[#FFB783] text-ink shadow-[0_12px_24px_rgba(255,122,0,0.14)]"
                  : "border border-[#E6B08B] bg-white/80 text-ink"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-10 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-5">
            {items.map((product, index) => {
              const href = `/mattresses/${product.slug}`;
              const price = formatPrice(getPrice(product));

              return (
                <Link
                  key={product.slug || index}
                  href={href}
                  className="group w-[280px] overflow-hidden rounded-[1.8rem] border border-ink/8 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.05)]"
                >
                  <div className="relative aspect-[4/4.2] overflow-hidden bg-[#F8F6F2]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#D95F0E]">
                      Eurofoam
                    </p>

                    <h3 className="mt-3 line-clamp-2 text-xl font-semibold leading-7 text-ink">
                      {product.name}
                    </h3>

                    {price ? (
                      <p className="mt-4 text-2xl font-black text-ink">
                        {price}
                      </p>
                    ) : null}

                    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-xs font-black text-ink">
                      Shop now <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

const roomNames = [
  "Bedroom",
  "Guest Room",
  "Master Suite",
  "Kids Room",
  "Studio",
  "Premium Living"
];

export default function ShopByRooms({
  products
}: {
  products: any[];
}) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D95F0E]">
              Discover by space
            </p>
            <h2 className="mt-3 font-display text-5xl leading-[0.92] sm:text-6xl">
              Shop by rooms
            </h2>
          </div>

          <Link
            href="/mattresses"
            className="hidden text-sm font-black text-ink/70 md:inline"
          >
            Explore all →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {roomNames.map((room, index) => {
            const product = products[index % Math.max(products.length, 1)];
            const image = product?.image || "/favicon.ico";
            const href = product?.slug ? `/mattresses/${product.slug}` : "/mattresses";

            return (
              <Link
                key={room}
                href={href}
                className="group"
              >
                <div className="overflow-hidden rounded-[1.6rem] border border-ink/8 bg-[#F7F5F0] shadow-[0_12px_28px_rgba(0,0,0,0.04)]">
                  <div className="aspect-[1/1] overflow-hidden">
                    <img
                      src={image}
                      alt={room}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <div className="text-xl font-semibold text-ink">
                    {room}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

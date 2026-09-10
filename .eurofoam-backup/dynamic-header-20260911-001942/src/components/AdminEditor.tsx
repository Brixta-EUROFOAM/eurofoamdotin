"use client";

import { useMemo, useState, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react";
import type {
  Mattress,
  Review,
  SiteSettings,
  StoreData
} from "@/lib/catalog";

type Tab = "dashboard" | "site" | "products" | "reviews" | "account";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function newProduct(): Mattress {
  return {
    slug: `new-mattress-${Date.now()}`,
    name: "New Mattress",
    kicker: "Product positioning",
    category: "Essential",
    shortDescription: "Short product description.",
    longDescription: "Longer product story and construction explanation.",
    basePrice: 9990,
    compareAt: 12990,
    firmness: "Medium Firm · 7/10",
    rating: 5,
    reviews: 0,
    trial: "100-night trial",
    warranty: "10-year warranty",
    image: "",
    accent: "from-[#f6ead0] to-[#ead49e]",
    features: ["Feature one"],
    layers: [
      { name: "Comfort Layer", description: "Explain this layer." },
      { name: "Support Core", description: "Explain this layer." }
    ],
    sizes: [
      { label: "Single", priceAdd: 0 },
      { label: "Queen", priceAdd: 4000 },
      { label: "King", priceAdd: 6000 }
    ],
    heights: [
      { label: "6 inch", priceAdd: 0 },
      { label: "8 inch", priceAdd: 2500 }
    ]
  };
}

async function upload(file: File) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body: form
  });

  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Upload failed.");
  return body.url as string;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-ink/55">
      {children}
    </span>
  );
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-gold-dark"
    />
  );
}

function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-gold-dark"
    />
  );
}

function MediaField({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <TextInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="/media/... or https://..."
      />

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-full bg-ink px-4 py-2 text-xs font-black text-white">
          {busy ? "UPLOADING..." : "UPLOAD IMAGE"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              try {
                setBusy(true);
                onChange(await upload(file));
              } catch (error) {
                alert(error instanceof Error ? error.message : "Upload failed.");
              } finally {
                setBusy(false);
                event.target.value = "";
              }
            }}
          />
        </label>

        {value ? (
          <img
            src={value}
            alt=""
            className="h-20 w-28 rounded-xl border border-ink/10 bg-white object-contain"
          />
        ) : null}
      </div>
    </div>
  );
}

export default function AdminEditor({
  initial,
  username
}: {
  initial: StoreData;
  username: string;
}) {
  const [data, setData] = useState(() => clone(initial));
  const [tab, setTab] = useState<Tab>("dashboard");
  const [selectedSlug, setSelectedSlug] = useState(initial.products[0]?.slug || "");
  const [status, setStatus] = useState("");

  const selectedIndex = useMemo(
    () => data.products.findIndex((product) => product.slug === selectedSlug),
    [data.products, selectedSlug]
  );

  const product = data.products[selectedIndex];

  function updateSite(patch: Partial<SiteSettings>) {
    setData((current) => ({
      ...current,
      site: { ...current.site, ...patch }
    }));
  }

  function updateProduct(patch: Partial<Mattress>) {
    if (selectedIndex < 0) return;

    setData((current) => {
      const next = clone(current);
      next.products[selectedIndex] = {
        ...next.products[selectedIndex],
        ...patch
      };
      return next;
    });
  }

  function updateReview(index: number, patch: Partial<Review>) {
    setData((current) => {
      const next = clone(current);
      next.reviews[index] = { ...next.reviews[index], ...patch };
      return next;
    });
  }

  async function save() {
    setStatus("Saving...");

    const response = await fetch("/api/admin/store", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    setStatus(response.ok ? "Saved." : "Save failed.");
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "site", label: "Site & Home" },
    { id: "products", label: "Products" },
    { id: "reviews", label: "Reviews" },
    { id: "account", label: "Account" }
  ];

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-ink/10 bg-ink text-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-white p-2">
              <img
                src={data.site.logoUrl}
                alt={data.site.brandName}
                className="h-11 w-auto max-w-[145px] object-contain"
              />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-[0.16em] text-gold">
                Admin
              </div>
              <div className="text-sm text-white/55">{username}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50">{status}</span>
            <a
              href="/"
              target="_blank"
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-black"
            >
              VIEW SITE
            </a>
            <button
              onClick={save}
              className="rounded-full bg-gold px-5 py-2.5 text-xs font-black text-ink"
            >
              SAVE ALL
            </button>
            <form action="/api/admin/logout" method="post">
              <button className="rounded-full border border-white/20 px-4 py-2.5 text-xs font-black">
                LOGOUT
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-8 lg:grid-cols-[230px_1fr] lg:px-8">
        <aside className="h-fit rounded-[1.5rem] border border-ink/10 bg-white p-3">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-bold ${
                tab === item.id
                  ? "bg-ink text-white"
                  : "text-ink/65 hover:bg-sand"
              }`}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <main>
          {tab === "dashboard" ? (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
                Control centre
              </p>
              <h1 className="mt-3 font-display text-5xl">Eurofoam Admin.</h1>

              <div className="mt-8 grid gap-5 sm:grid-cols-3">
                {[
                  [String(data.products.length), "Products"],
                  [String(data.reviews.length), "Reviews"],
                  [data.site.tagline, "Current tagline"]
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[1.5rem] border border-ink/10 bg-white p-6">
                    <div className="font-display text-3xl">{value}</div>
                    <div className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-ink/45">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-ink/10 bg-white p-6">
                <h2 className="font-display text-3xl">What this admin controls</h2>
                <div className="mt-5 grid gap-4 text-sm leading-6 text-ink/65 md:grid-cols-2">
                  <div>• Logo, brand copy, announcement and homepage hero</div>
                  <div>• Mattress names, prices, descriptions and positioning</div>
                  <div>• Product images, sizes, heights, layers and features</div>
                  <div>• Customer reviews shown across the storefront</div>
                  <div>• Admin username and password from inside the website</div>
                  <div>• Uploaded media persisted outside disposable containers</div>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "site" ? (
            <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
                Brand & homepage
              </p>
              <h1 className="mt-3 font-display text-4xl">Site settings.</h1>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <label>
                  <FieldLabel>Brand name</FieldLabel>
                  <TextInput
                    value={data.site.brandName}
                    onChange={(e) => updateSite({ brandName: e.target.value })}
                  />
                </label>
                <label>
                  <FieldLabel>Brand suffix</FieldLabel>
                  <TextInput
                    value={data.site.brandSuffix}
                    onChange={(e) => updateSite({ brandSuffix: e.target.value })}
                  />
                </label>
                <label className="md:col-span-2">
                  <FieldLabel>Tagline</FieldLabel>
                  <TextInput
                    value={data.site.tagline}
                    onChange={(e) => updateSite({ tagline: e.target.value })}
                  />
                </label>
                <label className="md:col-span-2">
                  <FieldLabel>Announcement bar</FieldLabel>
                  <TextInput
                    value={data.site.announcement}
                    onChange={(e) => updateSite({ announcement: e.target.value })}
                  />
                </label>
                <label className="md:col-span-2">
                  <FieldLabel>Hero eyebrow</FieldLabel>
                  <TextInput
                    value={data.site.heroEyebrow}
                    onChange={(e) => updateSite({ heroEyebrow: e.target.value })}
                  />
                </label>
                <label className="md:col-span-2">
                  <FieldLabel>Hero title</FieldLabel>
                  <TextArea
                    rows={3}
                    value={data.site.heroTitle}
                    onChange={(e) => updateSite({ heroTitle: e.target.value })}
                  />
                </label>
                <label className="md:col-span-2">
                  <FieldLabel>Hero body</FieldLabel>
                  <TextArea
                    rows={5}
                    value={data.site.heroBody}
                    onChange={(e) => updateSite({ heroBody: e.target.value })}
                  />
                </label>
                <label>
                  <FieldLabel>Primary CTA</FieldLabel>
                  <TextInput
                    value={data.site.primaryCtaLabel}
                    onChange={(e) => updateSite({ primaryCtaLabel: e.target.value })}
                  />
                </label>
                <label>
                  <FieldLabel>Secondary CTA</FieldLabel>
                  <TextInput
                    value={data.site.secondaryCtaLabel}
                    onChange={(e) => updateSite({ secondaryCtaLabel: e.target.value })}
                  />
                </label>
                <div>
                  <FieldLabel>Logo</FieldLabel>
                  <MediaField
                    value={data.site.logoUrl}
                    onChange={(logoUrl) => updateSite({ logoUrl })}
                  />
                </div>
                <div>
                  <FieldLabel>Hero image</FieldLabel>
                  <MediaField
                    value={data.site.heroImage}
                    onChange={(heroImage) => updateSite({ heroImage })}
                  />
                </div>
                <label>
                  <FieldLabel>Email</FieldLabel>
                  <TextInput
                    value={data.site.email}
                    onChange={(e) => updateSite({ email: e.target.value })}
                  />
                </label>
                <label>
                  <FieldLabel>Phone</FieldLabel>
                  <TextInput
                    value={data.site.phone}
                    onChange={(e) => updateSite({ phone: e.target.value })}
                  />
                </label>
              </div>
            </section>
          ) : null}

          {tab === "products" ? (
            <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
              <aside className="h-fit rounded-[1.5rem] border border-ink/10 bg-white p-3">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">
                    Products
                  </span>
                  <button
                    onClick={() => {
                      const created = newProduct();
                      setData((current) => ({
                        ...current,
                        products: [...current.products, created]
                      }));
                      setSelectedSlug(created.slug);
                    }}
                    className="rounded-full bg-gold px-3 py-1.5 text-xs font-black"
                  >
                    + ADD
                  </button>
                </div>

                {data.products.map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => setSelectedSlug(item.slug)}
                    className={`mt-1 block w-full rounded-xl px-3 py-3 text-left ${
                      item.slug === selectedSlug
                        ? "bg-ink text-white"
                        : "hover:bg-sand"
                    }`}
                  >
                    <div className="font-bold">{item.name}</div>
                    <div className={`mt-1 text-xs ${item.slug === selectedSlug ? "text-white/50" : "text-ink/45"}`}>
                      {item.category}
                    </div>
                  </button>
                ))}
              </aside>

              {product ? (
                <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
                        Product editor
                      </p>
                      <h1 className="mt-2 font-display text-4xl">{product.name}</h1>
                    </div>
                    <button
                      onClick={() => {
                        if (!confirm(`Delete ${product.name}?`)) return;
                        const remaining = data.products.filter((_, i) => i !== selectedIndex);
                        setData((current) => ({ ...current, products: remaining }));
                        setSelectedSlug(remaining[0]?.slug || "");
                      }}
                      className="rounded-full border border-red-200 px-4 py-2 text-xs font-black text-red-700"
                    >
                      DELETE PRODUCT
                    </button>
                  </div>

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <label>
                      <FieldLabel>Name</FieldLabel>
                      <TextInput
                        value={product.name}
                        onChange={(e) => updateProduct({ name: e.target.value })}
                      />
                    </label>
                    <label>
                      <FieldLabel>Slug</FieldLabel>
                      <div className="flex gap-2">
                        <TextInput
                          value={product.slug}
                          onChange={(e) => {
                            const slug = slugify(e.target.value);
                            updateProduct({ slug });
                            setSelectedSlug(slug);
                          }}
                        />
                      </div>
                    </label>
                    <label>
                      <FieldLabel>Category</FieldLabel>
                      <TextInput
                        value={product.category}
                        onChange={(e) => updateProduct({ category: e.target.value })}
                      />
                    </label>
                    <label>
                      <FieldLabel>Badge</FieldLabel>
                      <TextInput
                        value={product.badge || ""}
                        onChange={(e) => updateProduct({ badge: e.target.value })}
                      />
                    </label>
                    <label className="md:col-span-2">
                      <FieldLabel>Kicker / positioning</FieldLabel>
                      <TextInput
                        value={product.kicker}
                        onChange={(e) => updateProduct({ kicker: e.target.value })}
                      />
                    </label>
                    <label className="md:col-span-2">
                      <FieldLabel>Short description</FieldLabel>
                      <TextArea
                        rows={3}
                        value={product.shortDescription}
                        onChange={(e) => updateProduct({ shortDescription: e.target.value })}
                      />
                    </label>
                    <label className="md:col-span-2">
                      <FieldLabel>Long description</FieldLabel>
                      <TextArea
                        rows={5}
                        value={product.longDescription}
                        onChange={(e) => updateProduct({ longDescription: e.target.value })}
                      />
                    </label>
                    <label>
                      <FieldLabel>Sale price ₹</FieldLabel>
                      <TextInput
                        type="number"
                        value={product.basePrice}
                        onChange={(e) => updateProduct({ basePrice: Number(e.target.value) })}
                      />
                    </label>
                    <label>
                      <FieldLabel>Compare-at price ₹</FieldLabel>
                      <TextInput
                        type="number"
                        value={product.compareAt}
                        onChange={(e) => updateProduct({ compareAt: Number(e.target.value) })}
                      />
                    </label>
                    <label>
                      <FieldLabel>Firmness</FieldLabel>
                      <TextInput
                        value={product.firmness}
                        onChange={(e) => updateProduct({ firmness: e.target.value })}
                      />
                    </label>
                    <label>
                      <FieldLabel>Trial</FieldLabel>
                      <TextInput
                        value={product.trial}
                        onChange={(e) => updateProduct({ trial: e.target.value })}
                      />
                    </label>
                    <label>
                      <FieldLabel>Warranty</FieldLabel>
                      <TextInput
                        value={product.warranty}
                        onChange={(e) => updateProduct({ warranty: e.target.value })}
                      />
                    </label>
                    <label>
                      <FieldLabel>Rating</FieldLabel>
                      <TextInput
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={product.rating}
                        onChange={(e) => updateProduct({ rating: Number(e.target.value) })}
                      />
                    </label>
                    <div className="md:col-span-2">
                      <FieldLabel>Product image</FieldLabel>
                      <MediaField
                        value={product.image}
                        onChange={(image) => updateProduct({ image })}
                      />
                    </div>
                  </div>

                  <div className="mt-8 border-t border-ink/10 pt-8">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-3xl">Features</h2>
                      <button
                        onClick={() => updateProduct({ features: [...product.features, "New feature"] })}
                        className="rounded-full border border-ink/15 px-3 py-2 text-xs font-black"
                      >
                        + FEATURE
                      </button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {product.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <TextInput
                            value={feature}
                            onChange={(e) => {
                              const features = [...product.features];
                              features[index] = e.target.value;
                              updateProduct({ features });
                            }}
                          />
                          <button
                            onClick={() =>
                              updateProduct({
                                features: product.features.filter((_, i) => i !== index)
                              })
                            }
                            className="rounded-xl border border-red-200 px-3 text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-ink/10 pt-8">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-3xl">Layers</h2>
                      <button
                        onClick={() =>
                          updateProduct({
                            layers: [
                              ...product.layers,
                              { name: "New layer", description: "Describe the material and its job." }
                            ]
                          })
                        }
                        className="rounded-full border border-ink/15 px-3 py-2 text-xs font-black"
                      >
                        + LAYER
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {product.layers.map((layer, index) => (
                        <div key={index} className="grid gap-3 rounded-xl bg-sand p-4 md:grid-cols-[.6fr_1.4fr_auto]">
                          <TextInput
                            value={layer.name}
                            onChange={(e) => {
                              const layers = clone(product.layers);
                              layers[index].name = e.target.value;
                              updateProduct({ layers });
                            }}
                          />
                          <TextInput
                            value={layer.description}
                            onChange={(e) => {
                              const layers = clone(product.layers);
                              layers[index].description = e.target.value;
                              updateProduct({ layers });
                            }}
                          />
                          <button
                            onClick={() =>
                              updateProduct({
                                layers: product.layers.filter((_, i) => i !== index)
                              })
                            }
                            className="rounded-xl border border-red-200 px-3 text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-8 border-t border-ink/10 pt-8 lg:grid-cols-2">
                    {([
                      ["Sizes", "sizes"],
                      ["Heights", "heights"]
                    ] as const).map(([title, key]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between">
                          <h2 className="font-display text-3xl">{title}</h2>
                          <button
                            onClick={() =>
                              updateProduct({
                                [key]: [...product[key], { label: "New option", priceAdd: 0 }]
                              })
                            }
                            className="rounded-full border border-ink/15 px-3 py-2 text-xs font-black"
                          >
                            + OPTION
                          </button>
                        </div>

                        <div className="mt-4 space-y-3">
                          {product[key].map((entry, index) => (
                            <div key={index} className="grid grid-cols-[1fr_120px_auto] gap-2">
                              <TextInput
                                value={entry.label}
                                onChange={(e) => {
                                  const entries = clone(product[key]);
                                  entries[index].label = e.target.value;
                                  updateProduct({ [key]: entries });
                                }}
                              />
                              <TextInput
                                type="number"
                                value={entry.priceAdd}
                                onChange={(e) => {
                                  const entries = clone(product[key]);
                                  entries[index].priceAdd = Number(e.target.value);
                                  updateProduct({ [key]: entries });
                                }}
                              />
                              <button
                                onClick={() =>
                                  updateProduct({
                                    [key]: product[key].filter((_, i) => i !== index)
                                  })
                                }
                                className="rounded-xl border border-red-200 px-3 text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="rounded-[1.5rem] bg-white p-8">Add a product to begin.</div>
              )}
            </div>
          ) : null}

          {tab === "reviews" ? (
            <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
                    Social proof
                  </p>
                  <h1 className="mt-2 font-display text-4xl">Reviews.</h1>
                </div>
                <button
                  onClick={() =>
                    setData((current) => ({
                      ...current,
                      reviews: [
                        ...current.reviews,
                        {
                          id: `review-${Date.now()}`,
                          stars: 5,
                          quote: "New review",
                          name: "Customer name",
                          product: "Product"
                        }
                      ]
                    }))
                  }
                  className="rounded-full bg-gold px-4 py-2 text-xs font-black"
                >
                  + ADD REVIEW
                </button>
              </div>

              <div className="mt-8 space-y-4">
                {data.reviews.map((review, index) => (
                  <div key={review.id} className="rounded-[1.3rem] bg-sand p-5">
                    <div className="grid gap-4 md:grid-cols-[120px_1fr_1fr_auto]">
                      <label>
                        <FieldLabel>Stars</FieldLabel>
                        <TextInput
                          type="number"
                          min="1"
                          max="5"
                          value={review.stars}
                          onChange={(e) => updateReview(index, { stars: Number(e.target.value) })}
                        />
                      </label>
                      <label>
                        <FieldLabel>Name / location</FieldLabel>
                        <TextInput
                          value={review.name}
                          onChange={(e) => updateReview(index, { name: e.target.value })}
                        />
                      </label>
                      <label>
                        <FieldLabel>Product</FieldLabel>
                        <TextInput
                          value={review.product}
                          onChange={(e) => updateReview(index, { product: e.target.value })}
                        />
                      </label>
                      <button
                        onClick={() =>
                          setData((current) => ({
                            ...current,
                            reviews: current.reviews.filter((_, i) => i !== index)
                          }))
                        }
                        className="self-end rounded-xl border border-red-200 px-4 py-3 text-xs font-black text-red-700"
                      >
                        DELETE
                      </button>
                    </div>

                    <label className="mt-4 block">
                      <FieldLabel>Review</FieldLabel>
                      <TextArea
                        rows={3}
                        value={review.quote}
                        onChange={(e) => updateReview(index, { quote: e.target.value })}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {tab === "account" ? (
            <AccountPanel username={username} />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function AccountPanel({ username }: { username: string }) {
  const [newUsername, setNewUsername] = useState(username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  return (
    <section className="max-w-2xl rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
        Security
      </p>
      <h1 className="mt-2 font-display text-4xl">Admin account.</h1>
      <p className="mt-4 text-sm leading-6 text-ink/55">
        Change the login from here. The current password is required. Leave the
        new-password field empty if you only want to change the username.
      </p>

      <div className="mt-8 space-y-5">
        <label className="block">
          <FieldLabel>Username</FieldLabel>
          <TextInput
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </label>
        <label className="block">
          <FieldLabel>Current password</FieldLabel>
          <TextInput
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <label className="block">
          <FieldLabel>New password (optional)</FieldLabel>
          <TextInput
            type="password"
            minLength={10}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>

        <button
          onClick={async () => {
            setMessage("Saving...");

            const response = await fetch("/api/admin/account", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: newUsername,
                currentPassword,
                newPassword
              })
            });

            const body = await response.json();

            if (response.ok) {
              setCurrentPassword("");
              setNewPassword("");
              setMessage("Account updated.");
            } else {
              setMessage(body.error || "Update failed.");
            }
          }}
          className="rounded-full bg-gold px-6 py-3 text-sm font-black"
        >
          UPDATE ACCOUNT
        </button>

        {message ? <p className="text-sm text-ink/60">{message}</p> : null}
      </div>
    </section>
  );
}

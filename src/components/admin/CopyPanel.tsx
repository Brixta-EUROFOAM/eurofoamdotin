"use client";

import type { StoreData } from "@/lib/catalog";
import { HOME_COPY } from "@/lib/site-copy";

/* Every heading and line on the homepage. Empty = use the default shown greyed out. */
export default function CopyPanel({ data, onChange }: { data: StoreData; onChange: (next: StoreData) => void }) {
  const copy = data.site.copy || {};
  const set = (key: string, value: string) => {
    const next = { ...copy, [key]: value };
    if (!value) delete next[key];
    onChange({ ...data, site: { ...data.site, copy: next } });
  };

  return (
    <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">Homepage text</p>
      <h1 className="mt-2 font-display text-4xl">Taglines &amp; headings</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        Type over any line. Leave a box empty to keep the original (shown faded). The main headline, brand tagline and
        announcement bar are under “Site &amp; Home”. Press SAVE ALL when done.
      </p>

      {HOME_COPY.map((group) => (
        <div key={group.title} className="mt-8 border-t border-ink/10 pt-6">
          <h2 className="font-display text-2xl">{group.title}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {group.fields.map((f) => (
              <label key={f.key} className={f.long ? "md:col-span-2" : ""}>
                <span className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-ink/55">
                  {f.label}
                  {copy[f.key] ? (
                    <button type="button" onClick={() => set(f.key, "")} className="normal-case tracking-normal text-red-700">
                      reset
                    </button>
                  ) : null}
                </span>
                {f.long ? (
                  <textarea
                    rows={3}
                    value={copy[f.key] || ""}
                    placeholder={f.def}
                    maxLength={400}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-gold"
                  />
                ) : (
                  <input
                    value={copy[f.key] || ""}
                    placeholder={f.def}
                    maxLength={160}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-gold"
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

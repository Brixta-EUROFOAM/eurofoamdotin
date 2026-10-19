"use client";

import type { StoreData } from "@/lib/catalog";
import { getSizing, type Sizing } from "@/lib/sizes";

/* Admin → Sizes & guide: custom-size rules and the "how to measure" guide. */
export default function SizingPanel({ data, onChange }: { data: StoreData; onChange: (next: StoreData) => void }) {
  const s = getSizing(data.site);
  const set = (patch: Partial<Sizing>) => onChange({ ...data, site: { ...data.site, sizing: { ...s, ...patch } } });
  const input = "w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-gold";
  const label = "mb-2 block text-xs font-black uppercase tracking-[0.12em] text-ink/55";

  return (
    <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">Sizes &amp; guide</p>
      <h1 className="mt-2 font-display text-4xl">How people pick a size</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        Each product&apos;s exact sizes and prices are under Products → Sizes. Here: custom sizes, and the measuring guide
        shown in the size picker and on <a href="/size-guide" target="_blank" className="underline">/size-guide</a>. Tip: send
        people <code>/mattresses/gadda-pro?variant=true</code> to open the size picker straight away. Press SAVE ALL when done.
      </p>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <h2 className="font-display text-2xl">Custom sizes</h2>
        <label className="mt-4 flex items-center gap-3 font-bold">
          <input type="checkbox" checked={s.customEnabled} onChange={(e) => set({ customEnabled: e.target.checked })} className="h-5 w-5" />
          Let customers order any size (shows a “Custom” option)
        </label>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label>
            <span className={label}>Custom-cut fee (₹)</span>
            <input type="number" min={0} value={s.customFee} onChange={(e) => set({ customFee: Math.max(0, Number(e.target.value)) })} className={input} />
          </label>
          <label>
            <span className={label}>Length min – max (inches)</span>
            <span className="flex gap-2">
              <input type="number" value={s.minLength} onChange={(e) => set({ minLength: Number(e.target.value) })} className={input} />
              <input type="number" value={s.maxLength} onChange={(e) => set({ maxLength: Number(e.target.value) })} className={input} />
            </span>
          </label>
          <label>
            <span className={label}>Breadth min – max (inches)</span>
            <span className="flex gap-2">
              <input type="number" value={s.minWidth} onChange={(e) => set({ minWidth: Number(e.target.value) })} className={input} />
              <input type="number" value={s.maxWidth} onChange={(e) => set({ maxWidth: Number(e.target.value) })} className={input} />
            </span>
          </label>
        </div>
        <p className="mt-3 text-sm text-ink/55">
          Price = the smallest standard size the custom size fits inside, plus the fee. Example: 70 × 58 is priced as Queen 72 × 60 + fee.
        </p>
      </div>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <h2 className="font-display text-2xl">Measuring guide</h2>
        <div className="mt-4 grid gap-4">
          <label>
            <span className={label}>Video link (optional — YouTube or MP4)</span>
            <input value={s.videoUrl || ""} placeholder="https://youtu.be/…" onChange={(e) => set({ videoUrl: e.target.value })} className={input} />
          </label>
          <label>
            <span className={label}>Fit tip (shown under the size options)</span>
            <input value={s.fitNote} maxLength={240} onChange={(e) => set({ fitNote: e.target.value })} className={input} />
          </label>
          <div>
            <span className={label}>Steps</span>
            <div className="grid gap-2">
              {s.measureSteps.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <span className="w-6 pt-3 text-right font-display text-lg text-ink/40">{i + 1}</span>
                  <textarea
                    rows={2}
                    value={step}
                    maxLength={300}
                    onChange={(e) => set({ measureSteps: s.measureSteps.map((x, j) => (j === i ? e.target.value : x)) })}
                    className={input}
                  />
                  <button
                    type="button"
                    onClick={() => set({ measureSteps: s.measureSteps.filter((_, j) => j !== i) })}
                    className="h-11 rounded-xl border border-red-200 px-3 text-red-700"
                    aria-label="Remove step"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => set({ measureSteps: [...s.measureSteps, ""] })}
              className="mt-3 rounded-full border border-ink/15 px-4 py-2 text-xs font-black"
            >
              + STEP
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

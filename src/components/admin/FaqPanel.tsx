"use client";

import { useRef, useState } from "react";
import type { StoreData } from "@/lib/catalog";
import { FAQS } from "@/lib/content";
import LinkedText from "@/components/store/LinkedText";

type Item = { q: string; a: string };

const PAGES: { label: string; href: string }[] = [
  { label: "Sleep quiz", href: "/sleep-quiz" },
  { label: "All mattresses", href: "/mattresses" },
  { label: "Compare", href: "/compare" },
  { label: "Why GADDA", href: "/why-gadda" },
  { label: "Reviews", href: "/reviews" },
  { label: "Track order", href: "/track-order" },
  { label: "Contact", href: "/contact" },
  { label: "Trial policy", href: "/policies/trial" },
  { label: "Warranty", href: "/policies/warranty" },
  { label: "Shipping", href: "/policies/shipping" },
  { label: "Cancellation & returns", href: "/policies/cancellation" },
  { label: "Terms", href: "/policies/terms" },
  { label: "Privacy", href: "/policies/privacy" },
];

function LinkMaker({ products, onInsert }: { products: StoreData["products"]; onInsert: (md: string) => void }) {
  const [text, setText] = useState("");
  const [href, setHref] = useState("/sleep-quiz");
  const [custom, setCustom] = useState("");
  const target = href === "custom" ? custom.trim() : href;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-sand/60 p-2 text-xs">
      <b className="px-1">Add link:</b>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="words to click, e.g. 60-second quiz"
        className="min-w-[180px] flex-1 rounded-lg border border-ink/15 px-2 py-1.5"
      />
      <span>→</span>
      <select value={href} onChange={(e) => setHref(e.target.value)} className="rounded-lg border border-ink/15 px-2 py-1.5">
        {PAGES.map((p) => (
          <option key={p.href} value={p.href}>
            {p.label}
          </option>
        ))}
        {products.map((p) => (
          <option key={p.slug} value={`/mattresses/${p.slug}`}>
            {p.name}
          </option>
        ))}
        <option value="custom">Other link…</option>
      </select>
      {href === "custom" ? (
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="/page or https://… or tel:…"
          className="min-w-[160px] rounded-lg border border-ink/15 px-2 py-1.5"
        />
      ) : null}
      <button
        type="button"
        disabled={!text.trim() || !target}
        onClick={() => {
          onInsert(`[${text.trim().replace(/[\[\]]/g, "")}](${target})`);
          setText("");
        }}
        className="rounded-full bg-ink px-3 py-1.5 font-black text-white disabled:opacity-40"
      >
        INSERT
      </button>
    </div>
  );
}

export default function FaqPanel({ data, onChange }: { data: StoreData; onChange: (next: StoreData) => void }) {
  const items: Item[] = data.site.faqs?.length ? data.site.faqs : FAQS.map(({ q, a }) => ({ q, a }));
  const areas = useRef<(HTMLTextAreaElement | null)[]>([]);
  const save = (faqs: Item[]) => onChange({ ...data, site: { ...data.site, faqs } });
  const setItem = (i: number, patch: Partial<Item>) => save(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    save(next);
  };

  return (
    <section className="rounded-[1.5rem] border border-ink/10 bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">FAQs</p>
          <h1 className="mt-2 font-display text-4xl">Questions people actually ask</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/60">
            Shown on the homepage (first 6), product pages (first 5) and the contact page (all). To link to a page, type
            the words, pick the page and press INSERT — or write <code>[words](/page)</code> yourself. Blank line = new
            paragraph. Press SAVE ALL when done.
          </p>
        </div>
        {data.site.faqs?.length ? (
          <button
            type="button"
            onClick={() => {
              if (confirm("Throw away your FAQ edits and go back to the original questions?"))
                onChange({ ...data, site: { ...data.site, faqs: undefined } });
            }}
            className="rounded-full border border-ink/15 px-4 py-2 text-xs font-black"
          >
            RESET TO ORIGINAL
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-ink/10 bg-sand/30 p-4">
            <div className="flex items-center gap-2">
              <span className="w-7 font-display text-xl text-ink/40">{i + 1}</span>
              <input
                value={item.q}
                maxLength={160}
                placeholder="Question"
                onChange={(e) => setItem(i, { q: e.target.value })}
                className="flex-1 rounded-xl border border-ink/15 bg-white px-3 py-2.5 font-bold"
              />
              <button type="button" disabled={!i} onClick={() => move(i, -1)} className="h-10 w-9 rounded-lg border border-ink/15 bg-white font-black disabled:opacity-30" aria-label="Up">
                ↑
              </button>
              <button
                type="button"
                disabled={i === items.length - 1}
                onClick={() => move(i, 1)}
                className="h-10 w-9 rounded-lg border border-ink/15 bg-white font-black disabled:opacity-30"
                aria-label="Down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => confirm(`Delete "${item.q}"?`) && save(items.filter((_, j) => j !== i))}
                className="h-10 w-9 rounded-lg border border-red-200 bg-white font-black text-red-700"
                aria-label="Delete"
              >
                ✕
              </button>
            </div>
            <textarea
              ref={(el) => {
                areas.current[i] = el;
              }}
              value={item.a}
              rows={3}
              maxLength={1500}
              placeholder="Answer"
              onChange={(e) => setItem(i, { a: e.target.value })}
              className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm"
            />
            <LinkMaker
              products={data.products}
              onInsert={(md) => {
                const el = areas.current[i];
                const at = el ? el.selectionStart : item.a.length;
                const end = el ? el.selectionEnd : item.a.length;
                const before = item.a.slice(0, at);
                const pad = before && !/\s$/.test(before) ? " " : "";
                setItem(i, { a: `${before}${pad}${md}${item.a.slice(end)}` });
              }}
            />
            {/\[[^\]]+\]\([^)]+\)/.test(item.a) ? (
              <p className="mt-2 text-sm text-ink/70">
                <b className="text-xs uppercase tracking-wider text-ink/40">Preview: </b>
                <LinkedText text={item.a} />
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => save([...items, { q: "", a: "" }])}
        className="mt-4 rounded-full bg-gold px-5 py-2.5 text-xs font-black"
      >
        + ADD QUESTION
      </button>
    </section>
  );
}

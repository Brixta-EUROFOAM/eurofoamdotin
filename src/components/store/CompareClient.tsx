"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FeelScale } from "@/components/store/MegaMenu";
import { SIZE_GROUPS, toCm, type SizeRow } from "@/lib/sizes";
import c from "./CompareClient.module.css";

/*
  Compare page: pick your bed size and height once, and all three prices
  follow. The table below shows only what's different between the three;
  what they share is one line underneath. Then every exact size in the
  picked group, priced side by side.
*/

export type CompareProduct = {
  slug: string;
  name: string;
  picture: string;
  firmness: string;
  pickIf: string;
  basePrice: number;
  layers: { name: string; swatch: string }[];
  upgrades: string[];
  heights: { label: string; priceAdd: number }[];
  sizes: SizeRow[];
  warranty: string;
};

type Props = {
  products: CompareProduct[];
  pick?: string;
  pickLabel?: string;
  trialNights: number;
  customSizes?: { fee: number } | null;
};

const rupees = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const groupOf = (r: SizeRow) => r.group || r.label.split(" ")[0];
const keyOf = (r: SizeRow) => (r.length && r.width ? `${r.length}x${r.width}` : r.label);

export default function CompareClient({ products, pick, pickLabel, trialNights, customSizes }: Props) {
  const groups = SIZE_GROUPS.filter((g) => products.some((p) => p.sizes.some((r) => groupOf(r) === g.id)));
  const startGroup = groups.find((g) => g.id === "Queen") || groups[0];

  // every exact size in a group, across all three mattresses
  const dimsOf = (gid: string) => {
    const seen = new Map<string, SizeRow>();
    for (const p of products) for (const r of p.sizes) if (groupOf(r) === gid && !seen.has(keyOf(r))) seen.set(keyOf(r), r);
    return [...seen.values()].sort((a, b) => (a.width || 0) - (b.width || 0) || (a.length || 0) - (b.length || 0));
  };
  const commonKey = (gid: string) => {
    const g = SIZE_GROUPS.find((x) => x.id === gid);
    const dims = dimsOf(gid);
    const k = g ? `${g.common[0]}x${g.common[1]}` : "";
    return dims.some((d) => keyOf(d) === k) ? k : dims[0] ? keyOf(dims[0]) : "";
  };

  const heights = Array.from(new Set(products.flatMap((p) => p.heights.map((h) => h.label))));
  const [group, setGroup] = useState(startGroup?.id || "");
  const [dim, setDim] = useState(() => commonKey(startGroup?.id || ""));
  const [height, setHeight] = useState(heights[0] || "");

  const dims = useMemo(() => dimsOf(group), [group]); // eslint-disable-line react-hooks/exhaustive-deps
  const chosen = dims.find((d) => keyOf(d) === dim) || dims[0];
  const info = SIZE_GROUPS.find((g) => g.id === group);

  const price = (p: CompareProduct, k: string) => {
    const row = p.sizes.find((r) => groupOf(r) === group && keyOf(r) === k);
    const h = p.heights.find((x) => x.label === height);
    return row && h ? { total: p.basePrice + row.priceAdd + h.priceAdd, row } : null;
  };
  const sizeName = (r?: SizeRow) => (r?.length && r.width ? `${group} ${r.length} × ${r.width} in` : r?.label || group);
  const buyHref = (p: CompareProduct) => {
    const hit = chosen ? price(p, keyOf(chosen)) : null;
    const q = new URLSearchParams();
    if (hit) q.set("size", hit.row.label);
    if (height) q.set("height", height);
    return `/mattresses/${p.slug}${q.toString() ? `?${q}` : ""}`;
  };

  // only rows where the three differ; the rest is one shared line
  const differs = (f: (p: CompareProduct) => string) => new Set(products.map(f)).size > 1;
  const heightsDiffer = differs((p) => p.heights.map((h) => h.label).join("|"));
  const warrantyDiffers = differs((p) => p.warranty);
  const sharedWarranty = !warrantyDiffers && products[0]?.warranty ? ` and a ${products[0].warranty.toLowerCase()}` : "";
  const sharedHeights = !heightsDiffer && heights.length > 1 ? ` Each one comes ${heights.join(" or ")} thick.` : "";

  return (
    <>
      {/* 1. your bed */}
      <section className={c.picker} aria-labelledby="your-bed">
        <div className="g-wrap">
          <h2 className={c.pickerTitle} id="your-bed">
            Your bed
          </h2>
          <div className={c.controls}>
            <div className={c.control} role="radiogroup" aria-label="Size">
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  role="radio"
                  aria-checked={group === g.id}
                  className={c.seg}
                  onClick={() => {
                    setGroup(g.id);
                    setDim(commonKey(g.id));
                  }}
                >
                  {g.id}
                </button>
              ))}
            </div>
            {dims.length > 1 ? (
              <label className={c.selectWrap}>
                <span className="g-sr">Exact size</span>
                <select className={c.select} value={chosen ? keyOf(chosen) : ""} onChange={(e) => setDim(e.target.value)}>
                  {dims.map((d) => (
                    <option key={keyOf(d)} value={keyOf(d)}>
                      {d.length && d.width ? `${d.length} × ${d.width} in (${toCm(d.length)} × ${toCm(d.width)} cm)` : d.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {heights.length > 1 ? (
              <div className={c.control} role="radiogroup" aria-label="Height">
                {heights.map((h) => (
                  <button key={h} type="button" role="radio" aria-checked={height === h} className={c.seg} onClick={() => setHeight(h)}>
                    {h}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <p className={c.fits}>
            {info?.fits} Measure the inside of your bed frame, not your old mattress.{" "}
            <Link href="/size-guide" className="g-link">
              How to measure
            </Link>
          </p>
        </div>
      </section>

      {/* 2. the three, side by side */}
      <section className={c.compare} aria-label="The three mattresses compared">
        <div className="g-wrap">
          <table className={c.table} style={{ ["--n" as string]: products.length }}>
            <caption className="g-sr">
              GADDA mattresses compared, priced for {sizeName(chosen)}, {height}
            </caption>
            <thead>
              <tr>
                <td className={c.corner} />
                {products.map((p) => (
                  <th key={p.slug} scope="col" className={c.prod}>
                    <Link href={`/mattresses/${p.slug}`} className={c.pic} tabIndex={-1} aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.picture} alt="" width={1120} height={700} decoding="async" />
                    </Link>
                    {p.slug === pick && pickLabel ? <span className={c.pickChip}>{pickLabel}</span> : null}
                    <Link href={`/mattresses/${p.slug}`} className={c.name}>
                      {p.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className={c.priceRow}>
                <th scope="row">
                  Your size
                  <small className={c.sizeNow}>
                    {sizeName(chosen)}, {height}
                  </small>
                </th>
                {products.map((p) => {
                  const hit = chosen ? price(p, keyOf(chosen)) : null;
                  return (
                    <td key={p.slug}>
                      {hit ? (
                        <>
                          <b className={c.price} aria-live="polite">
                            {rupees(hit.total)}
                          </b>
                          <Link href={buyHref(p)} className={`g-btn g-btn--sm ${c.buy}`} aria-label={`Choose ${p.name} in this size`}>
                            <span className={c.long}>Choose this size</span>
                            <span className={c.short}>Choose</span>
                          </Link>
                        </>
                      ) : (
                        <span className={c.none}>Not made in this size</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <th scope="row">Pick it if</th>
                {products.map((p) => (
                  <td key={p.slug}>{p.pickIf}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Feel</th>
                {products.map((p) => (
                  <td key={p.slug}>
                    <FeelScale firmness={p.firmness} />
                    <span className={c.feelWord}>{p.firmness}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Inside, top to bottom</th>
                {products.map((p) => (
                  <td key={p.slug}>
                    <ol className={c.layers}>
                      {p.layers.map((l, i) => (
                        <li key={l.name + i}>
                          <i style={{ background: l.swatch }} aria-hidden="true" />
                          {l.name}
                        </li>
                      ))}
                    </ol>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Upgrade</th>
                {products.map((p) => (
                  <td key={p.slug} className={p.upgrades.length ? undefined : c.muted}>
                    {p.upgrades.length ? p.upgrades.map((u) => <span key={u} className={c.upgrade}>{u}</span>) : "None. It's the simple one."}
                  </td>
                ))}
              </tr>
              {heightsDiffer ? (
                <tr>
                  <th scope="row">Heights</th>
                  {products.map((p) => (
                    <td key={p.slug}>{p.heights.map((h) => h.label).join(" or ")}</td>
                  ))}
                </tr>
              ) : null}
              {warrantyDiffers ? (
                <tr>
                  <th scope="row">Warranty</th>
                  {products.map((p) => (
                    <td key={p.slug}>{p.warranty}</td>
                  ))}
                </tr>
              ) : null}
            </tbody>
          </table>
          <p className={c.shared}>
            All three come with {trialNights} nights at home, delivery included, pay on delivery{sharedWarranty}.
            {sharedHeights} Prices include GST and delivery.
          </p>
        </div>
      </section>

      {/* 3. every exact size in the group */}
      {dims.length > 1 ? (
        <section className={c.chart} aria-labelledby="every-size">
          <div className="g-wrap">
            <h2 className="g-h2" id="every-size">
              All {group} sizes, {height}
            </h2>
            <p className="g-lede">Tap a row to price all three in that size above.</p>
            <div className={c.chartWrap}>
              <table className={c.chartTable}>
                <thead>
                  <tr>
                    <th scope="col">Length × breadth</th>
                    {products.map((p) => (
                      <th key={p.slug} scope="col" className={c.num}>
                        {p.name.replace(/^Gadda\s+/i, "")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dims.map((d) => {
                    const k = keyOf(d);
                    const on = chosen && keyOf(chosen) === k;
                    return (
                      <tr key={k} data-on={on || undefined}>
                        <th scope="row">
                          <button type="button" className={c.rowBtn} aria-pressed={on} onClick={() => setDim(k)}>
                            {d.length && d.width ? `${d.length} × ${d.width} in` : d.label}
                            {d.length && d.width ? <small>{toCm(d.length)} × {toCm(d.width)} cm</small> : null}
                          </button>
                        </th>
                        {products.map((p) => {
                          const hit = price(p, k);
                          return (
                            <td key={p.slug} className={c.num}>
                              {hit ? rupees(hit.total) : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {customSizes ? (
              <p className={c.custom}>
                Bed not on the list? Pick <b>Custom</b> on any mattress page and type your measurements. It&apos;s priced as
                the next size up{customSizes.fee ? `, plus ${rupees(customSizes.fee)} for cutting` : ""}.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

import type { ReactNode } from "react";

/*
  The product page "label": a woven mattress law-tag, sewn into the
  ticking seam of the mattress — indigo woven header, typewriter rows,
  care symbols and a "do not remove" stamp.
*/
export default function LawTag({ name, code, rows }: { name: string; code: string; rows: [ReactNode, ReactNode][] }) {
  return (
    <figure className="g-tag" aria-label={`Label for ${name}`}>
      <div className="g-tag-seam" aria-hidden="true">
        <span className="g-tag-stitch" />
      </div>
      <div className="g-tag-cloth">
        <header className="g-tag-woven">
          <span className="g-tag-brand">
            GADDA <i lang="hi">गद्दा</i>
          </span>
          <span className="g-tag-origin">Made in India</span>
        </header>

        <div className="g-tag-name">
          <b>{name}</b>
          <span>
            Style № {code} · Read this before you buy
          </span>
        </div>

        <dl className="g-tag-rows">
          {rows.map(([k, v], i) => (
            <div key={i}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <footer className="g-tag-foot">
          <span className="g-tag-stamp" aria-hidden="true">
            <b>DO NOT REMOVE</b>
            <i lang="hi">यह लेबल न हटाएँ</i>
          </span>
          <span className="g-tag-perf" aria-hidden="true" />
        </footer>
      </div>
    </figure>
  );
}

/* Care symbols, drawn like the ones printed on a care label. */
export function CareStrip() {
  const items: [string, ReactNode][] = [
    ["Turn it head-to-foot every 3 months", <path key="r" d="M8 16a8 8 0 0 1 14-5M24 16a8 8 0 0 1-14 5M22 6v5h-5M10 26v-5h5" />],
    ["Keep it dry — no water, no steam", <path key="d" d="M16 5c4 6 7 9.5 7 13a7 7 0 0 1-14 0c0-3.5 3-7 7-13zM6 6l20 20" />],
    ["Air it in the shade, not harsh sun", <path key="s" d="M16 10a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM16 3v3M16 26v3M3 16h3M26 16h3M7 7l2 2M23 23l2 2M6 26 26 6" />],
    ["Store it flat — don't fold it", <path key="f" d="M5 12h22v8H5zM16 8v16M6 6l20 20" />],
  ];
  return (
    <ul className="g-care">
      {items.map(([t, icon]) => (
        <li key={t}>
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {icon}
            </g>
          </svg>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

import type { ReactNode } from "react";

/*
  A sewn-in fabric tag, like the one stitched to the side of a real
  mattress: ticking-striped fold at the top, a running stitch inside the
  edge, small printed lines. Used for product details, order receipts and
  the footer maker's mark.
*/
export default function SewnLabel({
  title,
  rows,
  children,
  tone = "cream",
  className = "",
}: {
  title?: ReactNode;
  rows?: [ReactNode, ReactNode][];
  children?: ReactNode;
  tone?: "cream" | "white";
  className?: string;
}) {
  return (
    <div className={`g-label g-label--${tone} ${className}`}>
      <div className="g-label-fold" aria-hidden="true" />
      <div className="g-label-body">
        {title ? <div className="g-label-title">{title}</div> : null}
        {rows?.length ? (
          <dl className="g-label-rows">
            {rows.map(([k, v], i) => (
              <div key={i}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </div>
    </div>
  );
}

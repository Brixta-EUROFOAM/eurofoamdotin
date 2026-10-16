/*
  A rubber ink stamp: circular text around a centre mark, with a rough
  ink edge (SVG turbulence filter — no images, no scripts). Only ever
  stamp things that are true.
*/
import { useId } from "react";

export default function Stamp({
  ring,
  center,
  sub,
  tone = "indigo",
  size = 132,
  rotate = -9,
  className = "",
}: {
  ring: string;
  center: string;
  sub?: string;
  tone?: "indigo" | "rust" | "ink";
  size?: number;
  rotate?: number;
  className?: string;
}) {
  const id = `stamp${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const color = { indigo: "#263f8f", rust: "#b4321a", ink: "#23211e" }[tone];
  // Repeat the ring text until it wraps the circle, then fit it exactly.
  let text = `${ring} • `;
  while (text.length < 26) text += `${ring} • `;
  const tight = text.length > 40;
  const devanagari = /[\u0900-\u097F]/.test(center);

  return (
    <svg
      className={`g-stamp ${className}`}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={`${center}${sub ? ` ${sub}` : ""}: ${ring}`}
      style={{ transform: `rotate(${rotate}deg)`, color }}
    >
      <defs>
        <filter id={`${id}-ink`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 .85 .92 1" />
          </feComponentTransfer>
        </filter>
        <path id={`${id}-arc`} d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
      </defs>
      <g filter={`url(#${id}-ink)`} fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="94" strokeWidth="5" />
        <circle cx="100" cy="100" r="86" strokeWidth="1.6" />
        <circle cx="100" cy="100" r="54" strokeWidth="1.6" strokeDasharray="4 4" />
        <text fill="currentColor" stroke="none" fontSize="15.5" fontWeight="800" letterSpacing="3.2" fontFamily="var(--font-body), sans-serif">
          <textPath href={`#${id}-arc`} startOffset="0" textLength={448} lengthAdjust={tight ? "spacingAndGlyphs" : "spacing"}>
            {text.toUpperCase()}
          </textPath>
        </text>
        <text
          x="100"
          y={sub ? 101 : 110}
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
          fontSize={devanagari ? 38 : center.length > 5 ? 26 : 34}
          fontWeight={devanagari ? 400 : 800}
          fontFamily={devanagari ? "var(--font-yatra), serif" : "var(--font-display), sans-serif"}
        >
          {center}
        </text>
        {sub ? (
          <text x="100" y="124" textAnchor="middle" fill="currentColor" stroke="none" fontSize="14" fontWeight="700" letterSpacing="1.5" fontFamily="var(--font-body), sans-serif">
            {sub.toUpperCase()}
          </text>
        ) : null}
      </g>
    </svg>
  );
}

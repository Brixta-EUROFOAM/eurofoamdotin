/* Hand-drawn needle and thread, for empty states and the 404 page. */
export default function NeedleArt({ width = 220, className = "" }: { width?: number; className?: string }) {
  return (
    <svg
      className={`g-needle-art ${className}`}
      viewBox="0 0 260 120"
      width={width}
      height={(width * 120) / 260}
      aria-hidden="true"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* thread, looping */}
      <path
        d="M14 92 C 40 40, 70 110, 98 70 S 140 18, 160 58 S 196 96, 214 40"
        stroke="#b4321a"
        strokeWidth="2.2"
        strokeDasharray="7 6"
      />
      {/* needle */}
      <g transform="rotate(-38 222 32)">
        <path d="M206 30 L 252 31.2 Q 258 32 252 32.8 L 206 34 Q 203 32 206 30Z" fill="#8a857d" stroke="#5c5852" strokeWidth="1" />
        <ellipse cx="211" cy="32" rx="3.4" ry="1.1" fill="#fff" stroke="#5c5852" strokeWidth=".8" />
      </g>
      {/* a little tuft knot where the thread starts */}
      <circle cx="14" cy="92" r="5" fill="#263f8f" />
      <circle cx="14" cy="92" r="2" fill="#fff" />
    </svg>
  );
}

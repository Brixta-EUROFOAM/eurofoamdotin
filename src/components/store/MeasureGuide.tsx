import type { Sizing } from "@/lib/sizes";

/* How to measure a bed: a drawing of the frame + numbered steps (+ video if set in admin). */
export default function MeasureGuide({ sizing, compact = false }: { sizing: Sizing; compact?: boolean }) {
  const video = sizing.videoUrl?.trim();
  const yt = video?.match(/(?:youtu\.be\/|v=|shorts\/)([\w-]{11})/)?.[1];
  return (
    <div className={`g-measure ${compact ? "g-measure--compact" : ""}`}>
      <figure className="g-measure-fig">
        <svg viewBox="0 0 320 210" role="img" aria-label="Measure the inside of the bed frame: length from head to foot, breadth from side to side">
          <rect x="40" y="30" width="240" height="150" rx="8" fill="none" stroke="currentColor" strokeWidth="10" opacity=".22" />
          <rect x="52" y="42" width="216" height="126" rx="3" fill="var(--g-sand, #ecd3b2)" opacity=".55" />
          <rect x="40" y="20" width="240" height="14" rx="5" fill="currentColor" opacity=".35" />
          {/* length arrow */}
          <g stroke="var(--g-orange, #ff6500)" strokeWidth="2.5" fill="var(--g-orange, #ff6500)">
            <line x1="160" y1="50" x2="160" y2="160" />
            <path d="M160 44 l-6 10 h12 z M160 166 l-6 -10 h12 z" stroke="none" />
          </g>
          <text x="168" y="108" fontSize="13" fontWeight="800" fill="var(--g-orange, #ff6500)">
            Length
          </text>
          {/* breadth arrow */}
          <g stroke="var(--g-indigo, #263f8f)" strokeWidth="2.5" fill="var(--g-indigo, #263f8f)">
            <line x1="60" y1="190" x2="260" y2="190" />
            <path d="M54 190 l10 -6 v12 z M266 190 l-10 -6 v12 z" stroke="none" />
          </g>
          <text x="160" y="206" fontSize="13" fontWeight="800" textAnchor="middle" fill="var(--g-indigo, #263f8f)">
            Breadth (inside the frame)
          </text>
          <text x="160" y="16" fontSize="11" textAnchor="middle" fill="currentColor" opacity=".6">
            headboard
          </text>
        </svg>
      </figure>
      <ol className="g-measure-steps">
        {sizing.measureSteps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      {video ? (
        yt && !compact ? (
          <div className="g-measure-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${yt}`}
              title="How to measure your bed"
              loading="lazy"
              allow="encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <a href={video} target="_blank" rel="noopener noreferrer" className="g-link">
            ▶ Watch how to measure (40 sec)
          </a>
        )
      ) : null}
    </div>
  );
}

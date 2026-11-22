"use client";

import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

type FilmProduct = { slug: string; name: string; image: string; firmness: string; longDescription: string; layers: string[] };
type FilmProps = { products: FilmProduct[] };
const FRAMES_PER_CHAPTER = 96;
const DURATION = FRAMES_PER_CHAPTER * 3;
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const chapters = [
  {
    slug: "gadda-regular",
    num: "01",
    label: "Steady support",
    line: "Firm without the extras.",
    sub: "Comfort foam over a high-density support base.",
    feel: "Firm-ish",
  },
  {
    slug: "gadda-pro",
    num: "02",
    label: "Balanced cushioning",
    line: "Comfort without losing support.",
    sub: "Memory foam, a transition layer and 32D HR support.",
    feel: "Balanced",
  },
  {
    slug: "gadda-ultimate",
    num: "03",
    label: "Plush response",
    line: "A softer feel, with a dense foundation.",
    sub: "Cooling-oriented memory foam, adaptive foam and 40D HR support.",
    feel: "Plush-supportive",
  },
] as const;

function FilmComposition({ products }: FilmProps) {
  const frame = useCurrentFrame();
  const chapter = Math.max(0, Math.min(2, Math.floor(frame / FRAMES_PER_CHAPTER)));
  const f = frame - chapter * FRAMES_PER_CHAPTER;
  const story = chapters[chapter];
  const p = products.find((item) => item.slug === story.slug);
  const fade = interpolate(f, [0, 15, 80, 95], [0.55, 1, 1, 0.55], clamp);
  const photoScale = interpolate(f, [0, 95], [1.09, 1], clamp);
  const photoOffset = interpolate(f, [0, 95], [18, -12], clamp);
  const graphicShift = interpolate(f, [0, 30, 75, 95], [40, 0, 0, -8], clamp);
  const layers = (p?.layers || []).filter(Boolean).slice(0, 4);
  return (
    <AbsoluteFill style={{ background: "#eae5dc", color: "#24221d", overflow: "hidden", fontFamily: "'Hanken Grotesk Variable', sans-serif" }}>
      <AbsoluteFill style={{ opacity: fade, transform: `scale(${photoScale}) translate3d(0,${photoOffset}px,0)`, transformOrigin: "center" }}>
        {/* Real, currently configured GADDA catalogue photo. No synthetic product claims. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p?.image ? <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} /> : null}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(27,25,22,.85) 0%, rgba(27,25,22,.48) 48%, rgba(27,25,22,.02) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "6%", color: "#f9f5ed" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, fontSize: 18, fontWeight: 650, letterSpacing: 1.2 }}>
          <span>GADDA / THE CONSTRUCTION</span>
          <span>{story.num} / 03</span>
        </div>
        <div style={{ maxWidth: "70%", transform: `translate3d(0,${interpolate(f,[0,22],[24,0],clamp)}px,0)`, opacity: interpolate(f,[0,18],[0,1],clamp) }}>
          <div style={{ fontSize: 23, fontWeight: 650, marginBottom: 12, color: "#f0c9ad" }}>{story.label}</div>
          <div style={{ fontSize: 59, fontWeight: 780, lineHeight: 1.04, letterSpacing: -2.3 }}>{story.line}</div>
          <div style={{ fontSize: 20, lineHeight: 1.55, marginTop: 17, color: "#f6eee6" }}>{story.sub}</div>
        </div>
        <div style={{ maxWidth: "78%" }}>
          <div style={{ fontSize: 14, opacity: .85, letterSpacing: 1.4, marginBottom: 11 }}>LAYER-BY-LAYER — FROM TOP DOWN</div>
          {layers.map((name, i) => {
            const start = 14 + i * 9;
            const reveal = interpolate(f, [start, start + 18], [0, 1], clamp);
            return <div key={`${story.slug}-${name}-${i}`} style={{ display: "flex", gap: 14, padding: "7px 0", borderTop: "1px solid rgba(255,255,255,.38)", opacity: reveal, transform: `translate3d(${graphicShift * .16}px,${(1-reveal)*13}px,0)`, fontSize: 17 }}><span style={{ color: "#f3af7c", minWidth: 28, fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2,"0")}</span><span>{name}</span></div>;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/** Scroll-linked Remotion Player. No autoplay, audio, server rendering, WebGL or motion tracking. */
export default function SleepMatchFilm({ products }: FilmProps) {
  const track = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerRef>(null);
  const lastFrame = useRef(-1);
  const [active, setActive] = useState(0);
  const ready = chapters.every((chapter) => products.some((p) => p.slug === chapter.slug));

  useEffect(() => {
    const root = track.current;
    if (!root || !ready) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const update = () => {
      raf = 0;
      const bounds = root.getBoundingClientRect();
      const span = Math.max(1, bounds.height - window.innerHeight * 0.9);
      const fraction = Math.min(1, Math.max(0, (-bounds.top + window.innerHeight * .15) / span));
      const chapterIndex = Math.min(2, Math.floor(fraction * 3));
      const frame = reduced.matches ? chapterIndex * FRAMES_PER_CHAPTER + 50 : Math.round(fraction * (DURATION - 1));
      if (frame !== lastFrame.current) {
        lastFrame.current = frame;
        player.current?.seekTo(frame);
      }
      setActive((current) => current === chapterIndex ? current : chapterIndex);
    };
    const schedule = () => { if (!raf) raf = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [ready]);

  if (!ready) return null;
  return (
    <div className="sm4-story-range" ref={track}>
      <div className="sm4-chapters" aria-label="GADDA construction differences">
        {chapters.map((chapter, i) => {
          const p = products.find((product) => product.slug === chapter.slug)!;
          return (
            <article className={active === i ? "sm4-chapter is-active" : "sm4-chapter"} key={chapter.slug} id={`sm4-${chapter.slug}`}>
              <p className="sm4-kicker">{chapter.num} / 03 &nbsp; {chapter.label}</p>
              <h3>{p.name}</h3>
              <p className="sm4-feel">{p.firmness} feel</p>
              <p>{p.longDescription || chapter.sub}</p>
              <dl className="sm4-spec-list">
                {p.layers.slice(1, 4).map((layer, j) => <div key={`${layer}-${j}`}><dt>Layer {j + 1}</dt><dd>{layer}</dd></div>)}
              </dl>
              <a href={`/mattresses/${p.slug}`} className="sm4-inline-link">Explore {p.name} <span aria-hidden="true">→</span></a>
            </article>
          );
        })}
      </div>
      <div className="sm4-film-holder">
        <div className="sm4-film-box" aria-hidden="true">
          <Player
            ref={player}
            component={FilmComposition}
            inputProps={{ products }}
            durationInFrames={DURATION}
            fps={30}
            compositionWidth={1200}
            compositionHeight={900}
            initiallyMuted
            style={{ width: "100%", aspectRatio: "4 / 3" }}
          />
        </div>
        <div className="sm4-film-footer" aria-label="Chapter progress">
          <span>CONSTRUCTION STUDY</span>
          <div className="sm4-film-index">{chapters.map((c,i)=><span className={active === i ? "is-active" : ""} key={c.slug}>{c.num}</span>)}</div>
          <span>SCROLL TO EXPLORE</span>
        </div>
      </div>
    </div>
  );
}

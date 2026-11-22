"use client";

import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

type Layer = { name: string; material?: string; description?: string; visualKind?: string };
type FilmProduct = { slug: string; name: string; image: string; firmness: string; longDescription: string; layers: Layer[] };
type FilmProps = { products: FilmProduct[] };
const CHAPTER = 150;
const TOTAL = CHAPTER * 3;
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const scenes = [
  { slug: "gadda-regular", number: "01", heading: "Steady. Straightforward.", line: "A softer top. A firm foundation.", subtitle: "For the sleeper who prefers a more direct, steady feel without extra comfort technologies.", label: "FIRM-ISH", color: "#d2bda3" },
  { slug: "gadda-pro", number: "02", heading: "Comfort with structure.", line: "Memory foam above a responsive base.", subtitle: "A balanced-feel option when you want more contouring at the surface, with the choice of HR foam or pocket springs.", label: "BALANCED", color: "#c1b6a6" },
  { slug: "gadda-ultimate", number: "03", heading: "More layers. More give.", line: "Plush above a denser core.", subtitle: "Cooling-oriented and adaptive comfort layers, 40D HR support, with an optional latex top.", label: "PLUSH-SUPPORTIVE", color: "#c9c1b2" },
] as const;

function surfaceFor(layer: Layer) {
  const label = `${layer.name} ${layer.material || ""}`.toLowerCase();
  if (/cover|fabric/.test(label)) return "#ebe6dc";
  if (/cool/.test(label)) return "#bdbdb4";
  if (/latex/.test(label)) return "#d6c4a4";
  if (/spring/.test(label)) return "#9e9c93";
  if (/hr|high.density|hd/.test(label)) return "#a99783";
  if (/memory/.test(label)) return "#ceb9a5";
  return "#d8cdc1";
}

function Composition({ products }: FilmProps) {
  const frame = useCurrentFrame();
  const chapter = Math.min(2, Math.floor(frame / CHAPTER));
  const local = frame - chapter * CHAPTER;
  const scene = scenes[chapter];
  const product = products.find((p) => p.slug === scene.slug);
  const layers = product?.layers.slice(0, 5) || [];
  const imagePosition = interpolate(local, [0, CHAPTER - 1], [26, -12], clamp);
  const imageOpacity = interpolate(local, [0, 24, 111, 149], [0.1, 1, 1, 0.45], clamp);
  const photoScale = interpolate(local, [0, 149], [1.13, 1], clamp);
  const graphicReveal = interpolate(local, [25, 72], [0, 1], clamp);
  const subtitleReveal = interpolate(local, [75, 110], [0, 1], clamp);
  return <AbsoluteFill style={{ background: "#eee9e1", fontFamily: "'Hanken Grotesk Variable', system-ui, sans-serif", overflow: "hidden", color: "#201c18" }}>
    <div style={{ position: "absolute", inset: "0 45% 0 0", borderRight: "1px solid #d6cec4", padding: 48, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 15, fontWeight: 800, letterSpacing: 1.5 }}><span>GADDA / MATERIAL STUDY</span><span>{scene.number} / 03</span></div>
      <div>
        <span style={{ color: "#9a4c24", fontSize: 17, fontWeight: 800, letterSpacing: 1.2 }}>{scene.label}</span>
        <h2 style={{ fontSize: 54, letterSpacing: -2.2, lineHeight: 1.04, margin: "16px 0", fontWeight: 800, transform: `translateY(${interpolate(local,[0,30],[26,0],clamp)}px)`, opacity: interpolate(local,[0,26],[0,1],clamp) }}>{scene.heading}</h2>
        <p style={{ fontSize: 23, fontWeight: 550, lineHeight: 1.3, margin: "0 0 17px" }}>{scene.line}</p>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: "#5d554c", opacity: subtitleReveal }}>{scene.subtitle}</p>
      </div>
      <div style={{ borderTop: "1px solid #c5bdb2", paddingTop: 16, display: "flex", justifyContent: "space-between", fontSize: 14, letterSpacing: .8 }}><span>CONSTRUCTION / NOT A PERFORMANCE TEST</span><span>{scene.number}</span></div>
    </div>
    <div style={{ position: "absolute", inset: "0 0 0 55%", background: "#ddd5ca", overflow: "hidden" }}>
      {product?.image ? <img src={product.image} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", opacity: imageOpacity, transform: `translate3d(0,${imagePosition}px,0) scale(${photoScale})` }} /> : null}
      <div style={{ position: "absolute", inset: 0, background: "rgba(248,244,237,.43)", opacity: graphicReveal }} />
      <div style={{ position: "absolute", top: 36, right: 32, background: "#f7f4ee", border: "1px solid #cfc6bb", padding: "10px 15px", fontSize: 14, fontWeight: 850, letterSpacing: 1, opacity: graphicReveal }}>FROM TOP TO BASE</div>
      <div style={{ position: "absolute", top: 100, left: "9%", right: "9%", display: "grid", gap: 12, perspective: 500 }}>
        {layers.map((layer, i) => {
          const start = 26 + i * 13;
          const reveal = interpolate(local,[start,start + 28],[0,1],clamp);
          return <div key={`${scene.slug}-${i}`} style={{ background: surfaceFor(layer), border: "1px solid rgba(64,53,41,.4)", boxShadow: "0 10px 0 -6px rgba(50,40,30,.17)", minHeight: 74, display: "flex", alignItems: "center", gap: 12, padding: "13px 19px", transform: `translate3d(0,${(1-reveal)*55}px,0) rotateX(${(1-reveal)*12}deg)`, opacity: reveal }}>
            <div style={{ width: 31, minWidth: 31, borderRight: "1px solid rgba(54,44,36,.36)", fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{String(i+1).padStart(2,"0")}</div>
            <div style={{ minWidth: 0 }}><strong style={{ fontSize: 19, display: "block", letterSpacing: -.4 }}>{layer.name}</strong><span style={{ fontSize: 13, display: "block", color: "#51483e", marginTop: 4 }}>{layer.material || "Construction layer"}</span></div>
          </div>;
        })}
      </div>
      <div style={{ position: "absolute", bottom: 25, left: "9%", right: "9%", paddingTop: 13, borderTop: "1px solid #8d8274", fontSize: 13, color: "#443a30", opacity: graphicReveal }}>Layer order represents the published product specification; illustrations are schematic.</div>
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, height: 6, width: `${((frame+1) / TOTAL) * 100}%`, background: "#e66a24" }} />
  </AbsoluteFill>;
}

/** A user-driven scroll film. No autoplay, audio, canvas animation or automatic video downloading. */
export default function SleepMatchFilm({ products }: FilmProps) {
  const track = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerRef>(null);
  const lastFrame = useRef(-1);
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 780px)");
    const sync = () => setCompact(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const ready = scenes.every((scene) => products.some((p) => p.slug === scene.slug));

  useEffect(() => {
    const root = track.current;
    if (!root || !ready || compact) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const update = () => {
      raf = 0;
      const bounds = root.getBoundingClientRect();
      const span = Math.max(1, bounds.height - window.innerHeight * .85);
      const fraction = Math.max(0, Math.min(1, (-bounds.top + window.innerHeight * .08) / span));
      const chapter = Math.min(2, Math.floor(fraction * 3));
      const frame = reduced.matches ? chapter * CHAPTER + 100 : Math.round(fraction * (TOTAL - 1));
      if (frame !== lastFrame.current) { lastFrame.current = frame; player.current?.seekTo(frame); }
      setActive((old) => old === chapter ? old : chapter);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduced.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduced.removeEventListener("change", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ready, compact]);

  if (!ready) return <p>Explore GADDA Regular, Pro and Ultimate in the product comparison below.</p>;
  return <div ref={track} className="sm5-film-track">
    <div className="sm5-film-sticky">
      <div className="sm5-film-copy" aria-label="Mattress construction chapters">
        {scenes.map((scene,i) => {
          const item = products.find(p => p.slug === scene.slug)!;
          return <div key={scene.slug} className={active === i ? "sm5-film-chapter is-active" : "sm5-film-chapter"}>
            <span>{scene.number} / 03</span>
            <h3>{item.name}</h3>
            <p>{item.firmness} feel · {scene.line}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sm5-mobile-film-image" src={item.image} alt={`${item.name} construction`} loading="lazy" />
            <a href={`/mattresses/${item.slug}`}>Explore {item.name} →</a>
          </div>;
        })}
      </div>
      <div className="sm5-film-screen" aria-label="Scroll-controlled GADDA construction film">
        {!compact && <Player ref={player} component={Composition} inputProps={{ products }} durationInFrames={TOTAL} fps={30}
          compositionWidth={1200} compositionHeight={780} initiallyMuted style={{ width: "100%", aspectRatio: "1200 / 780" }} />}
      </div>
      <div className="sm5-film-footer"><span>SCROLL TO EXPLORE CONSTRUCTIONS</span><div>{scenes.map((scene,i)=><span key={scene.slug} className={active===i?"is-active":""}>{scene.number}</span>)}</div><a href="#sleepmatch">Find your match →</a></div>
    </div>
  </div>;
}

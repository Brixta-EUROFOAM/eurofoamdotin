"use client";

import { useEffect, useRef, useState } from "react";
import s from "./UltimateReveal.module.css";

/*
  Home hero: the Gadda Ultimate, taken apart. Numbered tags pop onto each
  layer when it comes on screen and the legend below lights up.

  Two ways to show it:
  - PHOTO (default): the studio layer photo in public/home/ultimate/.
  - FILM: set FILM below to a film that ends on the opened mattress. It plays
    once when the hero is on screen, then the tags pop in; "Watch it open
    again" replays. Reduced motion, Low Power Mode or a slow/failed video get
    the opened still straight away.
  If you swap the picture for one framed differently, move the SPOTS.
*/

type Film = { src: string; closed: string; open: string; w: number; h: number; bg: string };

const PHOTO = { src: "/home/ultimate/ultimate-layers.webp", w: 1000, h: 1000, bg: "#e9e1d9" };

// the earlier film (orange label) is still in public/home/ultimate/ if you want it back:
// { src: "/home/ultimate/ultimate-open.mp4", closed: "/home/ultimate/ultimate-closed.webp",
//   open: "/home/ultimate/ultimate-open.webp", w: 930, h: 600, bg: "#e8e3d6" }
const FILM = null as Film | null;

/* where each part sits in the picture, in % of width / height (top panel, then layers down) */
const SPOTS = FILM
  ? [
      { x: 56, y: 17 },
      { x: 64, y: 31.5 },
      { x: 72, y: 43 },
      { x: 80, y: 55 },
    ]
  : [
      { x: 46.7, y: 9.7 },
      { x: 56.4, y: 29.7 },
      { x: 59.2, y: 41.5 },
      { x: 62, y: 55.5 },
    ];

const FALLBACK = [
  { name: "Quilted cover", description: "Soft knit top, zips around the edge." },
  { name: "Cool memory foam", description: "Moulds to you, sleeps less warm." },
  { name: "Adaptive foam", description: "Moves with you when you turn." },
  { name: "40D HR foam", description: "Our densest base. Keeps your spine level." },
];

type Part = { name: string; description?: string };
type State = "idle" | "playing" | "done";

export default function UltimateReveal({
  name,
  layers,
  upgrade,
}: {
  name: string;
  layers: Part[];
  upgrade?: string;
}) {
  const parts = SPOTS.map((_, i) => (layers[i]?.name ? layers[i] : FALLBACK[i]));
  const video = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("idle");
  const [still, setStill] = useState(false);
  const frame = FILM || PHOTO;

  /* show the opened still with the tags, no film */
  const settle = () => {
    video.current?.pause();
    setStill(true);
    setState("done");
  };

  const play = () => {
    const v = video.current;
    if (!v) return settle();
    v.muted = true;
    setStill(false);
    setState("playing");
    try {
      v.currentTime = 0;
    } catch {
      /* not seekable yet: plays from the start anyway */
    }
    const started = v.play();
    if (started && typeof started.catch === "function") started.catch(settle);
  };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // photo: tags pop in shortly after the hero is on screen
    if (!FILM) {
      if (reduced || !("IntersectionObserver" in window)) {
        setState("done");
        return;
      }
      let timer = 0;
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            timer = window.setTimeout(() => setState("done"), 450);
          }
        },
        { threshold: 0.35 },
      );
      io.observe(el);
      return () => {
        io.disconnect();
        window.clearTimeout(timer);
      };
    }

    const v = video.current;
    if (!v) return;
    if (reduced) {
      settle();
      return;
    }

    const onEnd = () => setState("done");
    v.addEventListener("ended", onEnd);
    v.addEventListener("error", settle);

    // slow connection: don't leave people staring at a closed mattress
    const slow = window.setTimeout(() => {
      if (v.paused || v.readyState < 3) settle();
    }, 6000);

    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io?.disconnect();
            play();
          }
        },
        { threshold: 0.35 },
      );
      io.observe(el);
    } else {
      play();
    }

    return () => {
      window.clearTimeout(slow);
      io?.disconnect();
      v.removeEventListener("ended", onEnd);
      v.removeEventListener("error", settle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={s.reveal} data-state={state} data-still={(FILM ? still : true) || undefined}>
      <div className={s.stage} ref={box} style={{ aspectRatio: `${frame.w} / ${frame.h}`, background: frame.bg }}>
        {FILM ? (
          <video
            ref={video}
            className={s.film}
            src={FILM.src}
            poster={FILM.closed}
            width={FILM.w}
            height={FILM.h}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            aria-label={`${name} opening up: the zip cover lifts off and each layer rises out.`}
          />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={s.still}
          src={FILM ? FILM.open : PHOTO.src}
          alt={FILM ? "" : `${name} taken apart: zip cover, then each layer, top to bottom`}
          width={frame.w}
          height={frame.h}
          decoding="async"
          fetchPriority={FILM ? undefined : "high"}
        />
        {parts.map((p, i) => (
          <span
            key={p.name + i}
            className={s.spot}
            style={{ left: `${SPOTS[i].x}%`, top: `${SPOTS[i].y}%`, ["--i" as string]: i }}
            aria-hidden="true"
          >
            {i + 1}
          </span>
        ))}
        {FILM ? (
          <button
            type="button"
            className={s.replay}
            onClick={play}
            tabIndex={state === "done" ? 0 : -1}
            aria-label="Watch it open again"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={s.long}>Watch it open again</span>
            <span className={s.short}>Replay</span>
          </button>
        ) : null}
      </div>

      <ol className={s.legend} aria-label={`Inside the ${name}, top to bottom`}>
        {parts.map((p, i) => (
          <li key={p.name + i} className={s.item} style={{ ["--i" as string]: i }}>
            <span className={s.num} aria-hidden="true">
              {i + 1}
            </span>
            <b>{p.name}</b>
            {p.description ? <span className={s.desc}>{p.description}</span> : null}
          </li>
        ))}
      </ol>

      {upgrade ? <p className={s.note}>{upgrade}</p> : null}
    </div>
  );
}

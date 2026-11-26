"use client";
/*
  GADDA V12 — Lightweight Remotion <Player> host for editorial infographics & product reveals.
  - Strictly memoizes inputProps per Remotion Player best practices
  - Plays subtle entrance reveal once to a calm resting state
  - Pauses offscreen via IntersectionObserver
  - Renders a clean static editorial plate immediately when prefers-reduced-motion is active
    or if playback ever fails, keeping the experience attractive with zero animations.
*/
import React, { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import {
  STAGE_DURATION,
  STAGE_FPS,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  StageComposition,
  type StageInputProps,
} from "./StageComposition";

class StageErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

type StagePlayerProps = StageInputProps;

function StaticEditorialPlate({ props }: { props: StageInputProps }) {
  const isDark = props.stepKind === "result";
  const imgSrc = props.stepKind === "result" ? props.upgradePhoto || props.imageSrc : props.imageSrc;
  return (
    <div className={`sm11-static-plate ${isDark ? "is-dark" : ""}`}>
      <div className="sm11-static-head">
        <span>{props.eyebrow}</span>
        <strong>{props.badge}</strong>
      </div>
      <div className="sm11-static-art">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc} alt={props.imageAlt} />
      </div>
      <div className="sm11-static-foot">
        <p>{props.stepKind === "result" ? `${props.productName} — ${props.productTagline}` : props.caption}</p>
        <span>{props.footerRight}</span>
      </div>
    </div>
  );
}

export const StagePlayer = React.memo(function StagePlayer(props: StagePlayerProps) {
  const {
    campaign,
    stepKind,
    focus,
    eyebrow,
    badge,
    imageSrc,
    imageAlt,
    caption,
    footerRight,
    productKey,
    productName,
    productTagline,
    productLayers,
    upgradePhoto,
    startingPrices,
    nonMattressFlag,
  } = props;

  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);

    const el = hostRef.current;
    let obs: IntersectionObserver | undefined;
    if (el && "IntersectionObserver" in window) {
      obs = new IntersectionObserver(
        ([entry]) => setVisible(entry.isIntersecting),
        { threshold: 0.1 }
      );
      obs.observe(el);
    }
    return () => {
      mq.removeEventListener("change", sync);
      obs?.disconnect();
    };
  }, []);

  const inputProps = useMemo<StageInputProps>(
    () => ({
      campaign,
      stepKind,
      focus,
      eyebrow,
      badge,
      imageSrc,
      imageAlt,
      caption,
      footerRight,
      productKey,
      productName,
      productTagline,
      productLayers,
      upgradePhoto,
      startingPrices,
      nonMattressFlag,
    }),
    [
      campaign,
      stepKind,
      focus,
      eyebrow,
      badge,
      imageSrc,
      imageAlt,
      caption,
      footerRight,
      productKey,
      productName,
      productTagline,
      productLayers,
      upgradePhoto,
      startingPrices,
      nonMattressFlag,
    ]
  );

  // Replay masked reveal only on step or product change; hover focus updates stay steady at resting frame
  const chapterKey = `${campaign}:${stepKind}:${productKey}:${upgradePhoto || ""}`;
  const prevChapterRef = useRef(chapterKey);
  useEffect(() => {
    const p = playerRef.current;
    if (!p || reduced) return;
    const isNewChapter = prevChapterRef.current !== chapterKey;
    prevChapterRef.current = chapterKey;
    if (isNewChapter) {
      p.seekTo(0);
      if (visible) p.play();
    } else {
      p.seekTo(45);
      p.pause();
    }
  }, [chapterKey, focus, reduced, visible]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    if (!visible || reduced) p.pause();
  }, [visible, reduced]);

  const replay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    p.seekTo(0);
    p.play();
  }, []);

  const staticPlate = <StaticEditorialPlate props={inputProps} />;

  return (
    <div ref={hostRef} className="sm11-stage">
      <div className="sm11-viewport">
        {reduced ? (
          staticPlate
        ) : (
          <StageErrorBoundary fallback={staticPlate}>
            <Player
              ref={playerRef}
              component={StageComposition}
              inputProps={inputProps}
              durationInFrames={STAGE_DURATION}
              fps={STAGE_FPS}
              compositionWidth={STAGE_WIDTH}
              compositionHeight={STAGE_HEIGHT}
              autoPlay
              loop={false}
              initiallyMuted
              controls={false}
              clickToPlay={false}
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </StageErrorBoundary>
        )}
      </div>
      <div className="sm11-stage-bar">
        <span>Editorial sleep guide · real GADDA specifications</span>
        {reduced ? (
          <span>Static editorial view (reduced motion)</span>
        ) : (
          <button type="button" onClick={replay}>
            Replay reveal ↺
          </button>
        )}
      </div>
    </div>
  );
});

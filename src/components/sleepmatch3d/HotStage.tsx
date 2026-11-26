"use client";
/*
  Interactive Remotion Player host for the GADDA V9 3D stage.
  - Pause when offscreen (IntersectionObserver)
  - Respect prefers-reduced-motion + manual Pause/Resume & Replay controls
  - WebGL capability check + React ErrorBoundary graceful fallback
  - Smooth zero-cut world transitions when the user hovers/selects answers
*/
import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { Scene3D } from "./Scene3D";
import {
  captionAt,
  STORY_END,
  worldAt,
  type MatchKey,
  type SceneKey,
  type StageInput,
  type StageStack,
} from "./world";

const DURATION_FRAMES = 36000; // 20-minute continuous deterministic timeline at 30fps

function hasWebGL(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

class WebGLErrorBoundary extends Component<
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

export type HotStageProps = {
  scene: SceneKey;
  focus: string | null;
  product: MatchKey;
  stacks: StageStack[];
  roomFirst: boolean;
  fallbackImage: string;
  fallbackAlt: string;
  onStoryComplete?: () => void;
};

export default function HotStage({
  scene,
  focus,
  product,
  stacks,
  roomFirst,
  fallbackImage,
  fallbackAlt,
  onStoryComplete,
}: HotStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const [webglOk, setWebglOk] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [liveFrame, setLiveFrame] = useState(0);
  const storyDoneRef = useRef(false);

  // Detect WebGL, reduced-motion, mobile/low-core quality, and offscreen visibility
  useEffect(() => {
    setWebglOk(hasWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduced = () => setReduced(mq.matches);
    syncReduced();
    mq.addEventListener("change", syncReduced);

    const cores = navigator.hardwareConcurrency || 4;
    const isNarrow = window.innerWidth < 768;
    if (cores <= 4 || isNarrow) setQuality("low");

    const el = containerRef.current;
    let obs: IntersectionObserver | undefined;
    if (el && "IntersectionObserver" in window) {
      obs = new IntersectionObserver(
        ([entry]) => setVisible(entry.isIntersecting),
        { threshold: 0.08 }
      );
      obs.observe(el);
    }
    return () => {
      mq.removeEventListener("change", syncReduced);
      obs?.disconnect();
    };
  }, []);

  // Track continuous state transitions from previous world snapshot
  const [stageState, setStageState] = useState<StageInput>(() => ({
    scene,
    focus,
    t0: 0,
    from: null,
    product,
    stacks,
    roomFirst,
    reduced: false,
    quality: "high",
  }));

  const stageRef = useRef(stageState);
  stageRef.current = stageState;

  useEffect(() => {
    const curFrame = playerRef.current?.getCurrentFrame() ?? liveFrame;
    const prev = stageRef.current;
    if (
      prev.scene === scene &&
      prev.focus === focus &&
      prev.product === product &&
      prev.roomFirst === roomFirst &&
      prev.stacks === stacks &&
      prev.reduced === reduced &&
      prev.quality === quality
    ) {
      return;
    }
    const snapshot = worldAt(prev, curFrame);
    const sameScene = prev.scene === scene && prev.focus === focus;
    setStageState({
      scene,
      focus,
      t0: sameScene ? prev.t0 : curFrame,
      from: sameScene ? prev.from : snapshot,
      product,
      stacks,
      roomFirst,
      reduced,
      quality,
    });
  }, [scene, focus, product, stacks, roomFirst, reduced, quality, liveFrame]);

  // Play / pause synced to visibility, reduced-motion, and user toggle
  const shouldPlay = webglOk && visible && !reduced && !paused;
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    if (shouldPlay) p.play();
    else p.pause();
  }, [shouldPlay]);

  // Poll player frame gently (~10Hz) for HUD caption & story completion callback
  useEffect(() => {
    if (!webglOk) return;
    const id = window.setInterval(() => {
      const f = playerRef.current?.getCurrentFrame();
      if (typeof f === "number") {
        setLiveFrame(f);
        if (
          stageRef.current.scene === "story" &&
          !storyDoneRef.current &&
          f - stageRef.current.t0 >= STORY_END
        ) {
          storyDoneRef.current = true;
          onStoryComplete?.();
        }
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [webglOk, onStoryComplete]);

  const replayStory = useCallback(() => {
    storyDoneRef.current = false;
    const curFrame = playerRef.current?.getCurrentFrame() ?? 0;
    const snapshot = worldAt(stageRef.current, curFrame);
    setPaused(false);
    setStageState((prev) => ({
      ...prev,
      scene: "story",
      focus: null,
      t0: curFrame,
      from: snapshot,
    }));
  }, []);

  const caption = useMemo(
    () => captionAt(stageState, liveFrame),
    [stageState, liveFrame]
  );

  const activeStack = useMemo(
    () => stacks.find((s) => s.key === product) || stacks[0],
    [stacks, product]
  );

  const showLayerLegend =
    (scene === "solution" || (scene === "story" && liveFrame - stageState.t0 > 410 && liveFrame - stageState.t0 < 645)) &&
    activeStack;

  const fallbackUI = (
    <div className="g9-fallback">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={fallbackImage} alt={fallbackAlt} />
      <div className="g9-fallback-copy">
        <span>3D VIEW UNAVAILABLE</span>
        <p>Your browser disabled WebGL or is in reduced mode. The mattress finder and checkout below work normally.</p>
      </div>
    </div>
  );

  const isStudioBg =
    scene === "priority" ||
    scene === "solution" ||
    (scene === "story" && liveFrame - stageState.t0 > 350 && liveFrame - stageState.t0 < 660);

  return (
    <div ref={containerRef} className={`g9-stage ${isStudioBg ? "is-light" : "is-dark"}`}>
      <div className="g9-viewport">
        {webglOk ? (
          <WebGLErrorBoundary fallback={fallbackUI}>
            <Player
              ref={playerRef}
              component={Scene3D}
              inputProps={stageState}
              durationInFrames={DURATION_FRAMES}
              fps={30}
              compositionWidth={1280}
              compositionHeight={760}
              autoPlay={!reduced}
              loop
              initiallyMuted
              controls={false}
              clickToPlay={false}
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </WebGLErrorBoundary>
        ) : (
          fallbackUI
        )}

        {/* Editorial caption overlay */}
        {caption && caption.opacity > 0.02 && (
          <div className="g9-caption" style={{ opacity: caption.opacity }}>
            <span className="g9-caption-kicker">{caption.kicker}</span>
            <p className="g9-caption-line">{caption.line}</p>
          </div>
        )}

        {/* Real catalogue layer legend during exploded views */}
        {showLayerLegend && activeStack && (
          <aside className="g9-layer-legend" aria-label={`${activeStack.name} layer construction`}>
            <span className="g9-legend-title">
              {scene === "solution" ? `${activeStack.name} · Layers` : "Mattress cutaway"}
            </span>
            <ol>
              {activeStack.layers.map((layer, idx) => (
                <li key={`${layer.name}-${idx}`}>
                  <span>{String(idx + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{layer.name}</strong>
                    {layer.material && <small>{layer.material}</small>}
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        )}

        {/* Subtle playback controls */}
        <div className="g9-controls">
          <span className="g9-disclaimer">Conceptual 3D illustration · not a thermal test</span>
          <div className="g9-control-btns">
            {scene === "story" && (
              <button type="button" onClick={replayStory}>
                Replay
              </button>
            )}
            {!reduced && webglOk && (
              <button type="button" onClick={() => setPaused((v) => !v)}>
                {paused ? "Play" : "Pause"}
              </button>
            )}
            {reduced && <span className="g9-reduced-tag">Reduced motion</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
/*
  GADDA V12 — Infographic-First Remotion Presentation Stage.
  Uses curated, human-centred static editorial infographics and real GADDA studio
  product photography as the primary visual assets.
  Remotion is reserved strictly for:
  - Subtle masked image reveals and calm scale settle
  - Restrained kinetic typography captions
  - Clean product recommendation reveals
*/
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PRODUCT_POSITIONING, type CampaignKey, type MatchKey } from "./campaigns";

export type StageLayerInfo = {
  name: string;
  material: string;
  kind: string;
};

export type StageInputProps = {
  campaign: CampaignKey;
  stepKind: "concern" | "position" | "feel" | "priority" | "result";
  focus: string | null;
  eyebrow: string;
  badge: string;
  imageSrc: string;
  imageAlt: string;
  caption: string;
  footerRight: string;
  productKey: MatchKey;
  productName: string;
  productTagline: string;
  productLayers: StageLayerInfo[];
  upgradePhoto?: string;
  startingPrices: Record<MatchKey, string>;
  nonMattressFlag: boolean;
};

export const STAGE_WIDTH = 960;
export const STAGE_HEIGHT = 720;
export const STAGE_FPS = 30;
export const STAGE_DURATION = 90; // 3s: ~1.1s refined editorial reveal -> calm resting state

const INK = "#1c1a17";
const MUTED = "#655d53";
const IVORY = "#f5efe5";
const ORANGE = "#e96a32";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const smoothOut = Easing.bezier(0.16, 1, 0.3, 1);

/* ----------------------------------------------------- Editorial Infographic Stage (Q1, Q2, Q3) */

function InfographicStageScene({ props }: { props: StageInputProps }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle masked reveal + gentle scale settle (0 -> ~1.1s, then completely calm)
  const headerOp = interpolate(frame, [0, 0.35 * fps], [0, 1], { ...clamp, easing: smoothOut });
  const clipInset = interpolate(frame, [2, 26], [6, 0], { ...clamp, easing: smoothOut });
  const imgOp = interpolate(frame, [0, 18], [0.25, 1], { ...clamp, easing: smoothOut });
  const imgScale = interpolate(frame, [0, 38], [1.032, 1], { ...clamp, easing: smoothOut });

  const captionSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 24, stiffness: 150, mass: 0.9 },
  });
  const captionY = interpolate(captionSpring, [0, 1], [14, 0]);
  const captionOp = interpolate(frame, [6, 20], [0, 1], clamp);

  // Subtle triptych column labels beneath Q2 (Position) and Q3 (Feel)
  const triptychLabels =
    props.stepKind === "position"
      ? [
          { id: "side", label: "Side", active: props.focus === "side" || props.focus === "combo" },
          { id: "back", label: "Back", active: props.focus === "back" || props.focus === "combo" },
          { id: "stomach", label: "Stomach", active: props.focus === "stomach" || props.focus === "combo" },
        ]
      : props.stepKind === "feel"
        ? [
            { id: "firm", label: "Steady", active: props.focus === "firm" },
            { id: "balanced", label: "Balanced", active: props.focus === "balanced" },
            { id: "plush", label: "Cushioned", active: props.focus === "plush" },
          ]
        : null;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: IVORY,
        fontFamily: "var(--font-hanken), system-ui, sans-serif",
      }}
    >
      {/* Clean top editorial rule */}
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 34,
          right: 34,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 12,
          borderBottom: "1px solid rgba(28,26,23,0.11)",
          opacity: headerOp,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.13em", color: MUTED }}>
          {props.eyebrow}
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: ORANGE }}>
          {props.badge}
        </span>
      </div>

      {/* Single dominant static editorial infographic */}
      <div
        style={{
          position: "absolute",
          top: 66,
          left: 34,
          right: 34,
          bottom: triptychLabels ? 124 : 96,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: 12,
          clipPath: `inset(0 0 ${clipInset}% 0 round 12px)`,
        }}
      >
        <Img
          src={props.imageSrc}
          alt={props.imageAlt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: imgOp,
            transform: `scale(${imgScale})`,
            display: "block",
          }}
        />
      </div>

      {/* Clean column labels for 3-panel triptychs (Position / Feel) */}
      {triptychLabels && (
        <div
          style={{
            position: "absolute",
            left: 58,
            right: 58,
            bottom: 86,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 20,
            opacity: captionOp,
          }}
        >
          {triptychLabels.map((col) => (
            <div
              key={col.id}
              style={{
                textAlign: "center",
                padding: "6px 10px",
                borderRadius: 999,
                backgroundColor: col.active ? INK : "rgba(28,26,23,0.05)",
                color: col.active ? IVORY : MUTED,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
              }}
            >
              {col.label}
            </div>
          ))}
        </div>
      )}

      {/* Restrained kinetic caption bar */}
      <div
        style={{
          position: "absolute",
          left: 34,
          right: 34,
          bottom: 24,
          paddingTop: 12,
          borderTop: "1px solid rgba(28,26,23,0.11)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 20,
          opacity: captionOp,
          transform: `translate3d(0, ${captionY}px, 0)`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.4,
            color: INK,
            maxWidth: 660,
          }}
        >
          {props.caption}
        </p>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: MUTED,
            whiteSpace: "nowrap",
          }}
        >
          {props.footerRight}
        </span>
      </div>
    </AbsoluteFill>
  );
}

/* ----------------------------------------------------- Q4: THREE MATTRESSES STUDIO SHOWCASE */

function PriorityShowcaseScene({ props }: { props: StageInputProps }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 0.35 * fps], [0, 1], clamp);
  const cards: { key: MatchKey; focusId: string; role: string }[] = [
    { key: "regular", focusId: "essential", role: "ESSENTIALS" },
    { key: "pro", focusId: "everyday", role: "BALANCED" },
    { key: "ultimate", focusId: "premium", role: "COOLING-ORIENTED" },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: IVORY,
        fontFamily: "var(--font-hanken), system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 34,
          right: 34,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 12,
          borderBottom: "1px solid rgba(28,26,23,0.11)",
          opacity: headerOp,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.13em", color: MUTED }}>
          04 / THREE MATTRESSES. NO NONSENSE.
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: ORANGE }}>
          COMPARE THE RANGE
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          top: 78,
          left: 34,
          right: 34,
          opacity: interpolate(frame, [4, 18], [0, 1], clamp),
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-bricolage), system-ui, sans-serif",
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.06,
            color: INK,
          }}
        >
          Three honest builds. <span style={{ color: ORANGE }}>Pay only for what helps.</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 150,
          left: 34,
          right: 34,
          bottom: 88,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
        }}
      >
        {cards.map((c, idx) => {
          const prod = PRODUCT_POSITIONING[c.key];
          const active = props.focus === c.focusId;
          const p = spring({
            frame: frame - (4 + idx * 5),
            fps,
            config: { damping: 24, stiffness: 145 },
          });
          const y = interpolate(p, [0, 1], [18, 0]);
          const op = interpolate(frame, [4 + idx * 5, 16 + idx * 5], [0, 1], clamp);
          return (
            <div
              key={c.key}
              style={{
                borderRadius: 14,
                padding: 18,
                backgroundColor: active ? INK : "#fffdfa",
                color: active ? IVORY : INK,
                border: `1.5px solid ${active ? ORANGE : "rgba(28,26,23,0.12)"}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transform: `translate3d(0, ${y}px, 0)`,
                opacity: op,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    color: active ? ORANGE : MUTED,
                    marginBottom: 12,
                  }}
                >
                  <span>{c.role}</span>
                  <span>0{idx + 1}</span>
                </div>
                <div
                  style={{
                    height: 196,
                    borderRadius: 10,
                    overflow: "hidden",
                    backgroundColor: active ? "rgba(255,255,255,0.06)" : "#f3ece0",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Img
                    src={prod.photos.layers}
                    alt={`${prod.name} mattress layers`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
                <strong
                  style={{
                    display: "block",
                    fontFamily: "var(--font-bricolage), system-ui, sans-serif",
                    fontSize: 22,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {prod.name}
                </strong>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: active ? "rgba(245,239,229,0.8)" : MUTED,
                  }}
                >
                  {prod.tagline}
                </p>
              </div>
              <div
                style={{
                  paddingTop: 12,
                  borderTop: `1px solid ${active ? "rgba(245,239,229,0.16)" : "rgba(28,26,23,0.1)"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontSize: 11, color: active ? "rgba(245,239,229,0.68)" : MUTED }}>
                  Starts at
                </span>
                <strong style={{ fontSize: 19, fontVariantNumeric: "tabular-nums" }}>
                  {props.startingPrices[c.key]}
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 34,
          right: 34,
          bottom: 24,
          paddingTop: 12,
          borderTop: "1px solid rgba(28,26,23,0.11)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          fontWeight: 600,
          color: MUTED,
        }}
      >
        <span>{props.caption}</span>
        <span>Verified catalogue starting prices · GST included</span>
      </div>
    </AbsoluteFill>
  );
}

/* ----------------------------------------------------- STEP 5: PRODUCT RECOMMENDATION REVEAL */

function ProductRevealScene({ props }: { props: StageInputProps }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const prod = PRODUCT_POSITIONING[props.productKey];
  const heroPhoto = props.upgradePhoto || prod.photos.layers;

  const clipInset = interpolate(frame, [2, 26], [8, 0], { ...clamp, easing: smoothOut });
  const imgScale = interpolate(frame, [0, 38], [1.04, 1], { ...clamp, easing: smoothOut });
  const titleSpring = spring({ frame: frame - 4, fps, config: { damping: 24, stiffness: 150 } });
  const titleY = interpolate(titleSpring, [0, 1], [24, 0]);
  const titleOp = interpolate(frame, [4, 18], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1b1917",
        color: IVORY,
        fontFamily: "var(--font-hanken), system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 34,
          right: 34,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 12,
          borderBottom: "1px solid rgba(245,239,229,0.16)",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.13em", color: "#d5cbbd" }}>
          GADDA / YOUR SHORTLIST
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: ORANGE }}>
          {props.nonMattressFlag ? "COMFORT PREFERENCE FIT" : "PERSONALISED MATCH"}
        </span>
      </div>

      {/* Left: Masked real studio cutaway photography */}
      <div
        style={{
          position: "absolute",
          top: 76,
          left: 34,
          width: 492,
          bottom: 72,
          borderRadius: 14,
          overflow: "hidden",
          backgroundColor: "#26221e",
          border: "1px solid rgba(245,239,229,0.14)",
          clipPath: `inset(0 0 ${clipInset}% 0 round 14px)`,
        }}
      >
        <Img
          src={heroPhoto}
          alt={`${props.productName} studio cutaway showing interior layers`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imgScale})`,
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 14,
            bottom: 14,
            padding: "7px 12px",
            borderRadius: 999,
            backgroundColor: "rgba(27,25,23,0.84)",
            border: "1px solid rgba(245,239,229,0.2)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: IVORY,
          }}
        >
          {props.upgradePhoto ? "UPGRADED CONFIGURATION" : "STANDARD CONFIGURATION"}
        </div>
      </div>

      {/* Right: Kinetic product reveal + real catalogue layers */}
      <div
        style={{
          position: "absolute",
          top: 76,
          right: 34,
          width: 372,
          bottom: 72,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ opacity: titleOp, transform: `translate3d(0, ${titleY}px, 0)` }}>
          <div
            style={{
              fontFamily: "var(--font-bricolage), system-ui, sans-serif",
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: "-0.045em",
              lineHeight: 0.98,
              color: IVORY,
            }}
          >
            {props.productName}
          </div>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 17,
              fontWeight: 700,
              lineHeight: 1.38,
              color: ORANGE,
            }}
          >
            {props.productTagline}
          </p>
        </div>

        <div>
          <span
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "rgba(245,239,229,0.6)",
              marginBottom: 10,
            }}
          >
            VERIFIED LAYER CONSTRUCTION
          </span>
          <div style={{ display: "grid", gap: 8 }}>
            {props.productLayers.slice(0, 4).map((layer, idx) => {
              const lp = spring({
                frame: frame - (12 + idx * 5),
                fps,
                config: { damping: 24, stiffness: 150 },
              });
              const ly = interpolate(lp, [0, 1], [12, 0]);
              const lop = interpolate(frame, [12 + idx * 5, 22 + idx * 5], [0, 1], clamp);
              return (
                <div
                  key={`${layer.name}-${idx}`}
                  style={{
                    padding: "11px 14px",
                    borderRadius: 10,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(245,239,229,0.12)",
                    transform: `translate3d(0, ${ly}px, 0)`,
                    opacity: lop,
                  }}
                >
                  <strong style={{ display: "block", fontSize: 14, color: IVORY }}>
                    {layer.name}
                  </strong>
                  <span style={{ fontSize: 12, color: "rgba(245,239,229,0.72)" }}>
                    {layer.material}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 34,
          right: 34,
          bottom: 22,
          paddingTop: 10,
          borderTop: "1px solid rgba(245,239,229,0.14)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "rgba(245,239,229,0.68)",
        }}
      >
        <span>Real GADDA studio cutaway photography</span>
        <span>Preference-based shortlist · not a medical claim</span>
      </div>
    </AbsoluteFill>
  );
}

/* ----------------------------------------------------- MASTER ROUTER */

export const StageComposition: React.FC<StageInputProps> = (props) => {
  if (props.stepKind === "result") {
    return <ProductRevealScene props={props} />;
  }
  if (props.stepKind === "priority") {
    return <PriorityShowcaseScene props={props} />;
  }
  return <InfographicStageScene props={props} />;
};

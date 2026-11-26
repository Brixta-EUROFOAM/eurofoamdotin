"use client";
/*
  Premium 3D exploded-view mattress construction built from real GADDA
  catalogue layer specifications. Matches the studio cutaway photography:
  quilted AeroTex top cap, distinct PBR foam / latex / pocket-spring
  layers, and charcoal grid base tray with woven GADDA badge.
*/
import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { StageLayer, StageStack, World } from "./world";
import { chevronBumpMap, foamPoreBump, gaddaBadgeMap, gaddaBandMap, latexPinholeBump, loadPbr } from "./textures";

const LAYER_STYLE: Record<string, { color: string; roughness: number; h: number; glowTint?: string }> = {
  fabric:   { color: "#9c9a95", roughness: 0.92, h: 0.06 },
  cool:     { color: "#d7e3de", roughness: 0.84, h: 0.065, glowTint: "#79b8a9" },
  memory:   { color: "#efe6d6", roughness: 0.88, h: 0.065 },
  adaptive: { color: "#e6dbc6", roughness: 0.86, h: 0.07 },
  foam:     { color: "#ecdfbf", roughness: 0.88, h: 0.065 },
  latex:    { color: "#f0e5c8", roughness: 0.78, h: 0.075 },
  hr:       { color: "#68645e", roughness: 0.92, h: 0.135 },
  hd:       { color: "#76736d", roughness: 0.93, h: 0.135 },
  spring:   { color: "#3d3b38", roughness: 0.7,  h: 0.14 },
};

function styleFor(layer: StageLayer) {
  const k = layer.kind && layer.kind !== "auto" ? layer.kind : "";
  if (k && LAYER_STYLE[k]) return { key: k, ...LAYER_STYLE[k] };
  const n = `${layer.name} ${layer.material}`.toLowerCase();
  if (n.includes("cover") || n.includes("fabric")) return { key: "fabric", ...LAYER_STYLE.fabric };
  if (n.includes("cool")) return { key: "cool", ...LAYER_STYLE.cool };
  if (n.includes("latex")) return { key: "latex", ...LAYER_STYLE.latex };
  if (n.includes("spring")) return { key: "spring", ...LAYER_STYLE.spring };
  if (n.includes("adaptive")) return { key: "adaptive", ...LAYER_STYLE.adaptive };
  if (n.includes("memory")) return { key: "memory", ...LAYER_STYLE.memory };
  if (n.includes("hr")) return { key: "hr", ...LAYER_STYLE.hr };
  if (n.includes("hd")) return { key: "hd", ...LAYER_STYLE.hd };
  return { key: "foam", ...LAYER_STYLE.foam };
}

function PocketSpringCore({ width, depth, height }: { width: number; depth: number; height: number }) {
  const cols = 6;
  const rows = 8;
  const coils = useMemo(() => {
    const out: [number, number][] = [];
    for (let ix = 0; ix < cols; ix++) {
      for (let iz = 0; iz < rows; iz++) {
        const x = ((ix + 0.5) / cols - 0.5) * (width - 0.14);
        const z = ((iz + 0.5) / rows - 0.5) * (depth - 0.14);
        out.push([x, z]);
      }
    }
    return out;
  }, [width, depth]);

  return (
    <group>
      {/* Perimeter foam encasement border */}
      <mesh castShadow receiveShadow position={[0, 0, depth * 0.47]}>
        <boxGeometry args={[width, height, 0.06]} />
        <meshStandardMaterial color="#4a4844" roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, -depth * 0.47]}>
        <boxGeometry args={[width, height, 0.06]} />
        <meshStandardMaterial color="#4a4844" roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[width * 0.47, 0, 0]}>
        <boxGeometry args={[0.06, height, depth - 0.12]} />
        <meshStandardMaterial color="#4a4844" roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[-width * 0.47, 0, 0]}>
        <boxGeometry args={[0.06, height, depth - 0.12]} />
        <meshStandardMaterial color="#4a4844" roughness={0.9} />
      </mesh>
      {coils.map(([x, z], idx) => (
        <group key={idx} position={[x, 0, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.062, 0.062, height * 0.92, 14]} />
            <meshStandardMaterial color="#dfd9ce" roughness={0.88} transparent opacity={0.86} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.044, 0.008, 6, 14]} />
            <meshStandardMaterial color="#b4b8bc" metalness={0.78} roughness={0.28} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function SingleMattressStack({
  stack,
  explode,
  layerGlow = 0,
  scale = 1,
  position = [0, 0, 0],
  dimmed = false,
}: {
  stack: StageStack;
  explode: number;
  layerGlow?: number;
  scale?: number;
  position?: [number, number, number];
  dimmed?: boolean;
}) {
  const width = 1.48;
  const depth = 1.88;

  const maps = useMemo(() => ({
    chevron: chevronBumpMap(3, 4),
    band: gaddaBandMap(5, 1),
    badge: gaddaBadgeMap(),
    pores: foamPoreBump(5, 3),
    latex: latexPinholeBump(3, 4),
    knitDiff: loadPbr("/3d/tex/knitted_fleece_diff.jpg", 3, 4, true),
    knitNor: loadPbr("/3d/tex/knitted_fleece_nor_gl.jpg", 3, 4, false),
  }), []);

  const items = useMemo(() => {
    // Bottom to top order for clean vertical stacking
    const reversed = [...stack.layers].reverse();
    return reversed.map((layer) => ({ layer, style: styleFor(layer) }));
  }, [stack.layers]);

  const baseTrayH = 0.09;
  const gap = 0.145 * explode;

  const capGeom = useMemo(() => new RoundedBoxGeometry(width + 0.03, 0.075, depth + 0.03, 4, 0.028), []);
  const trayGeom = useMemo(() => new RoundedBoxGeometry(width + 0.04, baseTrayH, depth + 0.04, 4, 0.025), []);

  // Compute stacked Y centers
  let cursor = baseTrayH * 0.5;
  const placements = items.map((item, idx) => {
    const h = item.style.h;
    if (idx === 0) cursor += baseTrayH * 0.5 + gap * 0.8 + h * 0.5;
    else cursor += items[idx - 1].style.h * 0.5 + gap + h * 0.5;
    return { ...item, y: cursor, isTop: idx === items.length - 1 };
  });

  const opacity = dimmed ? 0.55 : 1;

  return (
    <group position={position} scale={scale}>
      {/* Charcoal woven base tray */}
      <mesh geometry={trayGeom} position={[0, baseTrayH * 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          map={maps.band}
          color={dimmed ? "#52504d" : "#ffffff"}
          roughness={0.86}
          transparent={dimmed}
          opacity={opacity}
        />
      </mesh>
      {/* Woven GADDA badge on front-right corner */}
      <mesh position={[width * 0.24, baseTrayH * 0.5, depth * 0.5 + 0.022]} castShadow>
        <planeGeometry args={[0.24, 0.068]} />
        <meshStandardMaterial map={maps.badge} roughness={0.82} transparent={dimmed} opacity={opacity} />
      </mesh>

      {/* Real catalogue layers */}
      {placements.map(({ layer, style, y, isTop }, idx) => {
        const isComfort = !isTop && idx >= placements.length - 2;
        const emissive = isComfort && layerGlow > 0.02 ? "#e96a32" : "#000000";
        const emissiveIntensity = isComfort ? layerGlow * 0.34 : 0;

        if (style.key === "spring") {
          return (
            <group key={`${layer.name}-${idx}`} position={[0, y, 0]}>
              <PocketSpringCore width={width} depth={depth} height={style.h} />
            </group>
          );
        }

        if (isTop && style.key === "fabric") {
          return (
            <mesh key={`${layer.name}-${idx}`} geometry={capGeom} position={[0, y, 0]} castShadow receiveShadow>
              <meshStandardMaterial
                color={dimmed ? "#bdbab4" : "#c8c5bf"}
                normalMap={maps.knitNor}
                normalScale={new THREE.Vector2(0.42, 0.42)}
                bumpMap={maps.chevron}
                bumpScale={0.015}
                roughness={0.92}
                transparent={dimmed}
                opacity={opacity}
              />
            </mesh>
          );
        }

        return (
          <mesh key={`${layer.name}-${idx}`} position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, style.h, depth]} />
            <meshStandardMaterial
              color={style.color}
              bumpMap={style.key === "latex" ? maps.latex : maps.pores}
              bumpScale={style.key === "latex" ? 0.014 : 0.008}
              roughness={style.roughness}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
              transparent={dimmed}
              opacity={opacity}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** Renders the Scene 02 cutaway, Scene 04 3-build comparison, and Scene 05 Solution reveal. */
export function MattressShowcase({
  w,
  stacks,
  activeProduct,
}: {
  w: World;
  stacks: StageStack[];
  activeProduct: StageStack;
}) {
  const showCutaway = w.mattressRise > 0.02 && w.solution < 0.5 && w.stacks < 0.5;
  const showSolution = w.solution > 0.02;
  const showCompare = w.stacks > 0.02;

  return (
    <group>
      {/* Scene 02 Understanding: mattress rises from bed & separates */}
      {showCutaway && (
        <group position={[0, 0.25 + w.mattressRise * 0.22, 0]} scale={0.92 + w.mattressRise * 0.08}>
          <SingleMattressStack stack={activeProduct} explode={w.explode} layerGlow={w.layerGlow} />
        </group>
      )}

      {/* Scene 04 Buying Priority: 3 GADDA builds side-by-side */}
      {showCompare && (
        <group position={[0, 0.12, 0]}>
          {stacks.map((stack, i) => {
            const focused = w.stackFocus[i] || 0;
            const anyFocused = w.stackFocus[0] + w.stackFocus[1] + w.stackFocus[2] > 0.1;
            const x = (i - 1) * 1.42;
            const y = focused * 0.16;
            const z = focused * 0.22;
            return (
              <SingleMattressStack
                key={stack.key}
                stack={stack}
                explode={0.42 + focused * 0.52}
                scale={0.58 + focused * 0.07}
                position={[x, y, z]}
                dimmed={anyFocused && focused < 0.2}
              />
            );
          })}
        </group>
      )}

      {/* Scene 05 Solution: hero exploded view of recommended GADDA mattress */}
      {showSolution && (
        <group position={[0, 0.32, 0]}>
          <SingleMattressStack
            stack={activeProduct}
            explode={w.solutionExplode}
            layerGlow={0}
            scale={1}
          />
        </group>
      )}
    </group>
  );
}

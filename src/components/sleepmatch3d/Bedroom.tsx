"use client";
/*
  Premium editorial 3D bedroom diorama for GADDA V9 ("Sleeping Hot").
  - Volumetric puffed 3D duvet / comforter (real rounded thickness, baffle
    quilting, folded cuff, side overhang, breathing motion, zero clipping).
  - Sculpted gusseted down pillows with pinched seams & subtle head indentation.
  - Continuous pillow-top deformable mattress with soft rounded crown, AeroTex
    chevron quilting, charcoal woven border, and natural body compression.
  - Refined Japandi bedroom architecture: vertical channeled linen headboard,
    curved oak bedside table, frosted alabaster dome lamp, sheer linen curtains.
  - Custom GLSL thermal storytelling shader on the mattress contact zone +
    gossamer feathered convection & window airflow ribbons.
*/
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { World } from "./world";
import { chevronBumpMap, duvetQuiltBump, gaddaBadgeMap, gaddaBandMap, loadPbr } from "./textures";

/* ------------------------------------------------------ thermal shader */

const THERMAL_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const THERMAL_FRAG = /* glsl */ `
  uniform float uHeat;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;

    vec2 sPos = vec2(0.0, 0.16);
    vec2 hPos = vec2(0.0, -0.14);
    float dS = length((p - sPos) * vec2(2.35, 2.15));
    float dH = length((p - hPos) * vec2(2.15, 1.95));

    float core = exp(-dS * dS * 1.9) * 0.92 + exp(-dH * dH * 1.8) * 1.0;
    core = clamp(core, 0.0, 1.15);

    float dist = min(dS, dH);
    float ripple = 0.5 + 0.5 * sin(dist * 10.5 - uTime * 2.1);
    float contour = smoothstep(0.18, 0.85, core) * (0.82 + 0.18 * ripple);

    vec3 outerCol = vec3(0.95, 0.67, 0.42);
    vec3 innerCol = vec3(0.91, 0.41, 0.19);
    vec3 col = mix(outerCol, innerCol, smoothstep(0.25, 0.95, core));

    float alpha = smoothstep(0.06, 0.9, contour) * uHeat * 0.48;
    gl_FragColor = vec4(col, alpha);
  }
`;

const RIBBON_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RIBBON_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPhase;
  varying vec2 vUv;
  void main() {
    float edgeX = sin(vUv.x * 3.14159265);
    float edgeY = sin(vUv.y * 3.14159265);
    float pulse = 0.65 + 0.35 * sin(vUv.y * 6.28318 - uPhase);
    float a = pow(edgeX, 1.6) * pow(edgeY, 1.3) * pulse * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

/* ----------------------------------------------------- sculpted pillow */

function SculptedPillow({
  position,
  rotation = [0, 0, 0],
  size = [0.76, 0.145, 0.45],
  indented = false,
  color = "#f4efe6",
  linenNor,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number, number];
  indented?: boolean;
  color?: string;
  linenNor: THREE.Texture;
}) {
  const geom = useMemo(() => {
    const [w, h, d] = size;
    const g = new THREE.BoxGeometry(w, h, d, 30, 6, 20);
    const pos = g.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const nx = x / (w * 0.5);
      const ny = y / (h * 0.5);
      const nz = z / (d * 0.5);

      const r2 = Math.min(1, Math.pow(Math.abs(nx), 2.3) + Math.pow(Math.abs(nz), 2.3));
      const fullness = Math.pow(Math.max(0.02, 1 - r2 * 0.86), 0.52);

      const cornerFlare = Math.abs(nx * nz);
      const xOut = x * (1 + cornerFlare * 0.045);
      const zOut = z * (1 + cornerFlare * 0.045);

      let yOut = y * fullness;
      if (y > 0) {
        yOut += fullness * 0.018;
      } else {
        yOut = Math.max(-h * 0.44, yOut);
      }

      if (indented && y > 0) {
        const dHead = Math.exp(-((nx * nx) / 0.22 + (nz * nz) / 0.34));
        yOut -= dHead * 0.036;
      }

      const crease = Math.sin(nx * 5.2 + nz * 3.1) * 0.0025 * (1 - Math.abs(ny) * 0.3);
      pos.setXYZ(i, xOut, yOut + crease, zOut);
    }

    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [size, indented]);

  return (
    <mesh geometry={geom} position={position} rotation={rotation} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        normalMap={linenNor}
        normalScale={new THREE.Vector2(0.32, 0.32)}
        roughness={0.92}
        sheen={0.55}
        sheenRoughness={0.7}
        sheenColor="#fffaf2"
      />
    </mesh>
  );
}

/* ------------------------------------------- plush deformable mattress */

function PlushBedMattress({ w, frame }: { w: World; frame: number }) {
  const capGeomRef = useRef<THREE.BoxGeometry>(null);
  const thermalGeomRef = useRef<THREE.PlaneGeometry>(null);

  const width = 1.56;
  const depth = 1.96;
  const baseH = 0.145;
  const capH = 0.115;

  const maps = useMemo(
    () => ({
      knitNor: loadPbr("/3d/tex/knitted_fleece_nor_gl.jpg", 3, 4, false),
      chevron: chevronBumpMap(3.5, 4.5),
      band: gaddaBandMap(6, 1),
      badge: gaddaBadgeMap(),
    }),
    []
  );

  const baseBox = useMemo(() => new RoundedBoxGeometry(width, baseH, depth, 4, 0.026), []);

  const capRest = useMemo(() => {
    const g = new THREE.BoxGeometry(width + 0.012, capH, depth + 0.012, 34, 4, 42);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const arr = new Float32Array(pos.array.length);
    arr.set(pos.array as Float32Array);
    g.dispose();
    return arr;
  }, [width, capH, depth]);

  const thermalMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: THERMAL_VERT,
        fragmentShader: THERMAL_FRAG,
        uniforms: {
          uHeat: { value: 0 },
          uTime: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  useLayoutEffect(() => {
    const cap = capGeomRef.current;
    const tPlane = thermalGeomRef.current;
    const s = THREE.MathUtils.clamp(w.sink, 0, 1);
    const maxDip = 0.012 + s * 0.056;

    const surfaceDipAt = (x: number, z: number) => {
      const dShoulder = Math.exp(-((x * x) / 0.15 + ((z + 0.28) * (z + 0.28)) / 0.13));
      const dHip = Math.exp(-((x * x) / 0.17 + ((z - 0.12) * (z - 0.12)) / 0.15));
      const dLegs = Math.exp(-((x * x) / 0.12 + ((z - 0.56) * (z - 0.56)) / 0.18)) * 0.32;
      return (dShoulder * 0.82 + dHip * 1.0 + dLegs) * maxDip;
    };

    const crownAt = (x: number, z: number) => {
      const ax = Math.min(1, Math.abs(x) / (width * 0.5));
      const az = Math.min(1, Math.abs(z) / (depth * 0.5));
      const bx = 1 - Math.pow(ax, 6);
      const bz = 1 - Math.pow(az, 6);
      return Math.max(0, bx * bz) * 0.024;
    };

    if (cap) {
      const pos = cap.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const rx = capRest[i * 3];
        const ry = capRest[i * 3 + 1];
        const rz = capRest[i * 3 + 2];

        const ny = ry / (capH * 0.5);
        const topFactor = Math.max(0, (ny + 0.35) / 1.35);

        const ax = Math.min(1, Math.abs(rx) / ((width + 0.012) * 0.5));
        const az = Math.min(1, Math.abs(rz) / ((depth + 0.012) * 0.5));
        const inset = ny > 0.4 ? Math.pow(Math.max(ax, az), 8) * 0.016 * ny : 0;
        const xOut = rx * (1 - inset * 0.5);
        const zOut = rz * (1 - inset * 0.5);

        const dip = surfaceDipAt(rx, rz);
        const crown = crownAt(rx, rz);
        const yOut = ry + topFactor * (crown - dip);

        pos.setXYZ(i, xOut, yOut, zOut);
      }
      pos.needsUpdate = true;
      cap.computeVertexNormals();
    }

    if (tPlane) {
      const pos = tPlane.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const py = pos.getY(i);
        const z = -py;
        const dip = surfaceDipAt(x, z);
        const crown = crownAt(x, z);
        pos.setZ(i, crown - dip + 0.004);
      }
      pos.needsUpdate = true;
    }

    thermalMat.uniforms.uHeat.value = THREE.MathUtils.clamp(w.heatSurface, 0, 1);
    thermalMat.uniforms.uTime.value = frame / 30;
  }, [w.sink, w.heatSurface, frame, capRest, capH, width, depth, thermalMat]);

  return (
    <group position={[0, 0.27, 0]}>
      <mesh geometry={baseBox} position={[0, baseH * 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={maps.band} roughness={0.86} />
      </mesh>
      <mesh position={[width * 0.26, baseH * 0.5, depth * 0.5 + 0.004]}>
        <planeGeometry args={[0.24, 0.068]} />
        <meshStandardMaterial map={maps.badge} roughness={0.82} />
      </mesh>

      <mesh position={[0, baseH + capH * 0.5 - 0.006, 0]} castShadow receiveShadow>
        <boxGeometry ref={capGeomRef} args={[width + 0.012, capH, depth + 0.012, 34, 4, 42]} />
        <meshPhysicalMaterial
          color="#efe9df"
          normalMap={maps.knitNor}
          normalScale={new THREE.Vector2(0.32, 0.32)}
          bumpMap={maps.chevron}
          bumpScale={0.011}
          roughness={0.9}
          sheen={0.55}
          sheenRoughness={0.72}
          sheenColor="#fffaf2"
        />
      </mesh>

      {w.heatSurface > 0.03 && (
        <mesh
          position={[0, baseH + capH - 0.006, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={thermalMat}
        >
          <planeGeometry ref={thermalGeomRef} args={[width - 0.08, depth - 0.08, 28, 34]} />
        </mesh>
      )}
    </group>
  );
}

/* ------------------------------------------- volumetric plush duvet */

function PlushDuvet({ w, frame }: { w: World; frame: number }) {
  const duvetGeomRef = useRef<THREE.BoxGeometry>(null);
  const cuffGeomRef = useRef<THREE.BoxGeometry>(null);

  const maps = useMemo(
    () => ({
      linenNor: loadPbr("/3d/tex/rough_linen_nor_gl.jpg", 4, 4, false),
      quiltBump: duvetQuiltBump(4, 5),
    }),
    []
  );

  const segX = 44;
  const segY = 2;
  const segZ = 48;

  const duvetUnit = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1, segX, segY, segZ);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const arr = new Float32Array(pos.array.length);
    arr.set(pos.array as Float32Array);
    g.dispose();
    return arr;
  }, []);

  const cuffUnit = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1, 36, 2, 8);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const arr = new Float32Array(pos.array.length);
    arr.set(pos.array as Float32Array);
    g.dispose();
    return arr;
  }, []);

  useLayoutEffect(() => {
    const cover = THREE.MathUtils.clamp(w.blanketCover, 0, 1);
    const slide = THREE.MathUtils.clamp(w.blanketSlide, 0, 1);
    const lift = THREE.MathUtils.clamp(w.blanketLift, 0, 1);
    const t = (frame / 30) * 1.5;

    const zTop = THREE.MathUtils.lerp(0.58, -0.36, cover);
    const zBot = 1.04;

    const evalDrape = (u: number, v: number) => {
      const pullFactor = 1 - v * 0.55;
      const spanX = THREE.MathUtils.lerp(1.74, 1.38, slide * pullFactor);
      const xShift = slide * 0.24 * pullFactor;
      const x = u * spanX + xShift;
      const z = THREE.MathUtils.lerp(zTop, zBot, v);

      const torsoDome = Math.exp(-((x * x) / 0.21 + ((z + 0.06) * (z + 0.06)) / 0.26)) * 0.295;
      const kneeDome = Math.exp(-((x * x) / 0.19 + ((z - 0.36) * (z - 0.36)) / 0.20)) * 0.275;
      const footDome = Math.exp(-((x * x) / 0.16 + ((z - 0.72) * (z - 0.72)) / 0.14)) * 0.235 * (0.25 + 0.75 * cover);
      const bodyHeight = Math.max(torsoDome, kneeDome, footDome) * (1 - lift) * (0.3 + 0.7 * cover);

      const gather = (1 - cover) * (1 - v) * 0.042 + slide * pullFactor * 0.036;
      const waves =
        Math.sin(u * 10.5 + v * 4.2 + slide * 2.4) * (0.011 + gather) +
        Math.cos(v * 9.0 - u * 6.5) * (0.007 + gather * 0.45);

      const baffle = Math.abs(Math.sin(u * Math.PI * 5) * Math.sin(v * Math.PI * 6)) * 0.012;
      const breath =
        Math.sin(t) * 0.01 * (1 - lift) * Math.exp(-((x * x) / 0.2 + ((z + 0.12) * (z + 0.12)) / 0.22));

      const overX = Math.max(0, Math.abs(x) - 0.76);
      const overZ = Math.max(0, z - 0.96);
      const dropX = Math.pow(overX, 1.35) * 1.15 * (1 - lift);
      const dropZ = Math.pow(overZ, 1.35) * 0.95 * (1 - lift);
      const sidePleat = overX > 0.01 ? Math.sin(z * 11 + (x > 0 ? 0.5 : -0.5)) * 0.012 * overX * 5 : 0;

      const baseH = THREE.MathUtils.lerp(0.562, 1.54, lift);
      const centerY = baseH + bodyHeight + waves + baffle + breath - dropX - dropZ;

      const edgeU = 1 - Math.pow(Math.abs(u * 2), 6);
      const edgeV = 1 - Math.pow(Math.abs((v - 0.5) * 2), 6);
      const loft = (0.015 + 0.024 * Math.max(0, edgeU * edgeV)) * (1 + (1 - cover) * 0.22 * (1 - v));

      return { x: x + sidePleat, y: centerY, z, loft };
    };

    const g = duvetGeomRef.current;
    if (g) {
      const pos = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const u = duvetUnit[i * 3];
        const uy = duvetUnit[i * 3 + 1];
        const v = duvetUnit[i * 3 + 2] + 0.5;

        const { x, y, z, loft } = evalDrape(u, v);
        const yOff = uy > 0 ? uy * 2 * loft : uy * 2 * (loft * 0.55);
        pos.setXYZ(i, x, y + yOff, z);
      }
      pos.needsUpdate = true;
      g.computeVertexNormals();
    }

    const cg = cuffGeomRef.current;
    if (cg) {
      const pos = cg.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const u = cuffUnit[i * 3];
        const uy = cuffUnit[i * 3 + 1];
        const cv = cuffUnit[i * 3 + 2] + 0.5;
        const v = cv * 0.145;
        const { x, y, z, loft } = evalDrape(u, v);
        const cuffThickness = 0.014 * Math.sin(cv * Math.PI) + 0.008;
        const rollLip = Math.sin(cv * Math.PI) * 0.012;
        pos.setXYZ(i, x, y + loft + rollLip + uy * 2 * cuffThickness, z);
      }
      pos.needsUpdate = true;
      cg.computeVertexNormals();
    }
  }, [w.blanketCover, w.blanketSlide, w.blanketLift, frame, duvetUnit, cuffUnit]);

  if (w.blanket <= 0.01) return null;

  const heat = THREE.MathUtils.clamp(w.heatBedding, 0, 1);

  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry ref={duvetGeomRef} args={[1, 1, 1, segX, segY, segZ]} />
        <meshPhysicalMaterial
          color="#ebe3d6"
          normalMap={maps.linenNor}
          normalScale={new THREE.Vector2(0.45, 0.45)}
          bumpMap={maps.quiltBump}
          bumpScale={0.009}
          roughness={0.92}
          sheen={0.78}
          sheenRoughness={0.65}
          sheenColor="#fffaf2"
          emissive="#e96a32"
          emissiveIntensity={heat * 0.16}
          transparent={w.blanket < 0.99}
          opacity={w.blanket}
        />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry ref={cuffGeomRef} args={[1, 1, 1, 36, 2, 8]} />
        <meshPhysicalMaterial
          color="#f7f2ea"
          normalMap={maps.linenNor}
          normalScale={new THREE.Vector2(0.3, 0.3)}
          roughness={0.88}
          sheen={0.65}
          sheenRoughness={0.6}
          sheenColor="#ffffff"
          emissive="#e96a32"
          emissiveIntensity={heat * 0.12}
          transparent={w.blanket < 0.99}
          opacity={w.blanket}
        />
      </mesh>
    </group>
  );
}

/* --------------------------------- gossamer thermal & airflow ribbons */

function EditorialThermalAtmosphere({ w, frame }: { w: World; frame: number }) {
  const heatStrength = Math.max(w.heatSurface * 0.85, w.heatBedding * 0.9);
  const airStrength = w.airflow;
  const t = frame / 30;

  const heatPlumes = useMemo(() => {
    const specs = [
      { x: -0.26, z: -0.22, h: 0.56, sway: 0.05 },
      { x: 0.04, z: -0.05, h: 0.64, sway: -0.06 },
      { x: 0.24, z: 0.14, h: 0.52, sway: 0.045 },
    ];
    return specs.map((s, idx) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(s.sway, s.h * 0.35, 0.03),
        new THREE.Vector3(-s.sway * 0.7, s.h * 0.7, -0.02),
        new THREE.Vector3(s.sway * 0.4, s.h, 0),
      ]);
      const geom = new THREE.TubeGeometry(curve, 24, 0.028, 8, false);
      const mat = new THREE.ShaderMaterial({
        vertexShader: RIBBON_VERT,
        fragmentShader: RIBBON_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color("#f0884a") },
          uOpacity: { value: 0 },
          uPhase: { value: idx * 2.1 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      return { ...s, geom, mat, idx };
    });
  }, []);

  const airStreams = useMemo(() => {
    const zLanes = [-0.42, -0.02, 0.36];
    return zLanes.map((z, idx) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.15, 1.38, z),
        new THREE.Vector3(-1.1, 1.18 + (idx % 2 === 0 ? 0.06 : -0.04), z + 0.08),
        new THREE.Vector3(0.05, 1.02, z - 0.05),
        new THREE.Vector3(1.15, 0.92, z + 0.04),
      ]);
      const geom = new THREE.TubeGeometry(curve, 32, 0.018, 8, false);
      const mat = new THREE.ShaderMaterial({
        vertexShader: RIBBON_VERT,
        fragmentShader: RIBBON_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color("#a8d1c9") },
          uOpacity: { value: 0 },
          uPhase: { value: idx * 1.9 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      return { geom, mat, idx };
    });
  }, []);

  useLayoutEffect(() => {
    for (const p of heatPlumes) {
      p.mat.uniforms.uOpacity.value = heatStrength * 0.22;
      p.mat.uniforms.uPhase.value = t * 2.4 + p.idx * 2.0;
    }
    for (const a of airStreams) {
      a.mat.uniforms.uOpacity.value = airStrength * 0.32;
      a.mat.uniforms.uPhase.value = t * 2.8 + a.idx * 1.9;
    }
  }, [heatPlumes, airStreams, heatStrength, airStrength, t]);

  return (
    <group>
      {heatStrength > 0.08 &&
        heatPlumes.map((p) => {
          const rise = ((t * 0.22 + p.idx * 0.33) % 1) * 0.14;
          return (
            <mesh
              key={`hp-${p.idx}`}
              geometry={p.geom}
              material={p.mat}
              position={[p.x, 0.68 + rise, p.z]}
            />
          );
        })}

      {airStrength > 0.05 &&
        airStreams.map((a) => (
          <mesh key={`as-${a.idx}`} geometry={a.geom} material={a.mat} />
        ))}
    </group>
  );
}

/* ------------------------------------------- channeled linen headboard */

function ChanneledHeadboard({
  fabricNor,
  oakDiff,
}: {
  fabricNor: THREE.Texture;
  oakDiff: THREE.Texture;
}) {
  const panelGeom = useMemo(() => new RoundedBoxGeometry(0.24, 0.84, 0.085, 4, 0.032), []);
  const frameGeom = useMemo(() => new RoundedBoxGeometry(1.78, 0.9, 0.06, 4, 0.02), []);
  const panels = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <group position={[0, 0.72, -1.04]}>
      <mesh geometry={frameGeom} position={[0, 0, -0.02]} castShadow receiveShadow>
        <meshStandardMaterial color="#b38e68" map={oakDiff} roughness={0.68} />
      </mesh>
      {panels.map((k) => (
        <mesh
          key={k}
          geometry={panelGeom}
          position={[k * 0.244, 0, 0.015]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color="#d8cfc1"
            normalMap={fabricNor}
            normalScale={new THREE.Vector2(0.4, 0.4)}
            roughness={0.93}
            sheen={0.55}
            sheenRoughness={0.72}
            sheenColor="#fff8ee"
          />
        </mesh>
      ))}
    </group>
  );
}

/* --------------------------------------------------- main bedroom stage */

export function Bedroom({ w, frame }: { w: World; frame: number }) {
  const maps = useMemo(
    () => ({
      oakDiff: loadPbr("/3d/tex/oak_veneer_01_diff.jpg", 3, 3, true),
      oakNor: loadPbr("/3d/tex/oak_veneer_01_nor_gl.jpg", 3, 3, false),
      wallNor: loadPbr("/3d/tex/plastered_wall_nor_gl.jpg", 2.5, 2, false),
      headNor: loadPbr("/3d/tex/waffle_pique_cotton_nor_gl.jpg", 3, 2, false),
      linenNor: loadPbr("/3d/tex/rough_linen_nor_gl.jpg", 2.5, 2.5, false),
    }),
    []
  );

  const nightstandGeom = useMemo(() => new RoundedBoxGeometry(0.52, 0.44, 0.46, 4, 0.03), []);
  const platformGeom = useMemo(() => new RoundedBoxGeometry(1.7, 0.145, 2.1, 4, 0.022), []);

  const showRoom = w.room > 0.02;
  const showBed = w.bed > 0.02;
  const roomHeatTint = w.heatRoom > 0.05 ? "#e96a32" : "#000000";

  return (
    <group>
      {showRoom && (
        <group scale={[1, 0.94 + w.room * 0.06, 1]}>
          <mesh position={[0, -0.06, 0]} receiveShadow>
            <boxGeometry args={[5.4, 0.12, 5.4]} />
            <meshPhysicalMaterial
              color="#c9ae8e"
              map={maps.oakDiff}
              normalMap={maps.oakNor}
              normalScale={new THREE.Vector2(0.32, 0.32)}
              roughness={0.68}
              clearcoat={0.12}
              clearcoatRoughness={0.65}
              transparent={w.room < 0.99}
              opacity={w.room}
            />
          </mesh>

          <mesh position={[0.04, 0.008, 0.22]} receiveShadow>
            <boxGeometry args={[2.76, 0.016, 2.92]} />
            <meshPhysicalMaterial
              color="#e0d7c8"
              normalMap={maps.linenNor}
              normalScale={new THREE.Vector2(0.45, 0.45)}
              roughness={0.96}
              sheen={0.4}
              sheenRoughness={0.8}
              transparent={w.room < 0.99}
              opacity={w.room}
            />
          </mesh>

          <mesh position={[0, 1.35, -2.54]} receiveShadow>
            <boxGeometry args={[5.4, 2.7, 0.12]} />
            <meshStandardMaterial
              color="#ded6c9"
              normalMap={maps.wallNor}
              normalScale={new THREE.Vector2(0.24, 0.24)}
              roughness={0.94}
              emissive={roomHeatTint}
              emissiveIntensity={w.heatRoom * 0.07}
              transparent={w.room < 0.99}
              opacity={w.room}
            />
          </mesh>

          <mesh position={[-2.54, 1.35, 0]} receiveShadow>
            <boxGeometry args={[0.12, 2.7, 5.4]} />
            <meshStandardMaterial
              color="#d7cfc2"
              normalMap={maps.wallNor}
              normalScale={new THREE.Vector2(0.24, 0.24)}
              roughness={0.94}
              emissive={roomHeatTint}
              emissiveIntensity={w.heatRoom * 0.07}
              transparent={w.room < 0.99}
              opacity={w.room}
            />
          </mesh>

          <mesh position={[0, 0.05, -2.47]}>
            <boxGeometry args={[5.2, 0.1, 0.022]} />
            <meshStandardMaterial
              color="#47433e"
              roughness={0.78}
              transparent={w.room < 0.99}
              opacity={w.room}
            />
          </mesh>
          <mesh position={[-2.47, 0.05, 0]}>
            <boxGeometry args={[0.022, 0.1, 5.2]} />
            <meshStandardMaterial
              color="#47433e"
              roughness={0.78}
              transparent={w.room < 0.99}
              opacity={w.room}
            />
          </mesh>

          <group position={[-2.46, 1.48, -0.25]}>
            <mesh>
              <boxGeometry args={[0.08, 1.28, 1.48]} />
              <meshStandardMaterial
                color="#312f2c"
                roughness={0.7}
                transparent={w.room < 0.99}
                opacity={w.room}
              />
            </mesh>
            <mesh position={[0.044, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[1.36, 1.16]} />
              <meshStandardMaterial
                color="#1c2738"
                emissive="#324d73"
                emissiveIntensity={0.62 + w.windowOpen * 0.4}
                roughness={0.25}
                transparent={w.room < 0.99}
                opacity={w.room}
              />
            </mesh>
            <group position={[0.05, 0, -0.68]} rotation={[0, w.windowOpen * 0.62, 0]}>
              <mesh position={[0, 0, 0.34]}>
                <boxGeometry args={[0.022, 1.14, 0.67]} />
                <meshStandardMaterial
                  color="#a5bcd2"
                  roughness={0.18}
                  metalness={0.08}
                  transparent
                  opacity={0.25 * w.room}
                />
              </mesh>
              <mesh position={[0.014, 0, 0.34]}>
                <boxGeometry args={[0.028, 1.14, 0.032]} />
                <meshStandardMaterial
                  color="#312f2c"
                  roughness={0.7}
                  transparent={w.room < 0.99}
                  opacity={w.room}
                />
              </mesh>
            </group>
            {[-0.82, 0.82].map((cz, ci) => (
              <mesh key={ci} position={[0.09, -0.22, cz]} castShadow>
                <boxGeometry args={[0.04, 1.95, 0.24]} />
                <meshPhysicalMaterial
                  color="#e7e0d4"
                  normalMap={maps.linenNor}
                  normalScale={new THREE.Vector2(0.35, 0.35)}
                  roughness={0.94}
                  sheen={0.5}
                  transparent
                  opacity={0.86 * w.room}
                />
              </mesh>
            ))}
          </group>

          <group position={[-1.38, 0, -0.78]}>
            <mesh geometry={nightstandGeom} position={[0, 0.26, 0]} castShadow receiveShadow>
              <meshPhysicalMaterial
                color="#bc9974"
                map={maps.oakDiff}
                roughness={0.68}
                clearcoat={0.08}
                transparent={w.room < 0.99}
                opacity={w.room}
              />
            </mesh>
            {[
              [-0.19, 0.05, -0.16],
              [0.19, 0.05, -0.16],
              [-0.19, 0.05, 0.16],
              [0.19, 0.05, 0.16],
            ].map(([lx, ly, lz], i) => (
              <mesh key={i} position={[lx, ly, lz]} castShadow>
                <cylinderGeometry args={[0.018, 0.013, 0.1, 10]} />
                <meshStandardMaterial
                  color="#967452"
                  roughness={0.7}
                  transparent={w.room < 0.99}
                  opacity={w.room}
                />
              </mesh>
            ))}
            <mesh position={[0, 0.54, 0]} castShadow>
              <cylinderGeometry args={[0.048, 0.072, 0.13, 24]} />
              <meshStandardMaterial
                color="#57514b"
                roughness={0.5}
                transparent={w.room < 0.99}
                opacity={w.room}
              />
            </mesh>
            <mesh position={[0, 0.65, 0]} castShadow>
              <sphereGeometry args={[0.145, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
              <meshPhysicalMaterial
                color="#f7ead7"
                emissive="#ffbe78"
                emissiveIntensity={0.95 * w.lamp}
                roughness={0.42}
                sheen={0.35}
                side={THREE.DoubleSide}
                transparent={w.room < 0.99}
                opacity={w.room}
              />
            </mesh>
            <mesh position={[0.15, 0.515, 0.12]} castShadow>
              <cylinderGeometry args={[0.026, 0.023, 0.07, 16]} />
              <meshPhysicalMaterial
                color="#e9e1d5"
                roughness={0.35}
                clearcoat={0.3}
                transparent={w.room < 0.99}
                opacity={w.room}
              />
            </mesh>
          </group>
        </group>
      )}

      {showBed && (
        <group>
          <mesh geometry={platformGeom} position={[0, 0.205, 0]} castShadow receiveShadow>
            <meshPhysicalMaterial
              color="#ad8a66"
              map={maps.oakDiff}
              roughness={0.68}
              clearcoat={0.08}
            />
          </mesh>
          {[
            [-0.76, 0.07, -0.96],
            [0.76, 0.07, -0.96],
            [-0.76, 0.07, 0.96],
            [0.76, 0.07, 0.96],
          ].map(([lx, ly, lz], i) => (
            <mesh key={i} position={[lx, ly, lz]} castShadow>
              <cylinderGeometry args={[0.032, 0.021, 0.14, 14]} />
              <meshStandardMaterial color="#8f6d4c" roughness={0.68} />
            </mesh>
          ))}

          <ChanneledHeadboard fabricNor={maps.headNor} oakDiff={maps.oakDiff} />

          <PlushBedMattress w={w} frame={frame} />

          <SculptedPillow
            position={[0, 0.68, -0.91]}
            rotation={[0.42, 0, 0]}
            size={[0.88, 0.135, 0.36]}
            color="#e6ddd0"
            linenNor={maps.linenNor}
          />
          <SculptedPillow
            position={[0, 0.575, -0.69]}
            size={[0.78, 0.15, 0.45]}
            indented
            color="#f5f0e7"
            linenNor={maps.linenNor}
          />
        </group>
      )}

      <PlushDuvet w={w} frame={frame} />

      <EditorialThermalAtmosphere w={w} frame={frame} />
    </group>
  );
}

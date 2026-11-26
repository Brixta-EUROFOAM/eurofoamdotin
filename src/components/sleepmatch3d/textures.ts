/*
  PBR texture loader & procedural material maps for the GADDA 3D stage.
  Uses CC0 PolyHaven normal/diffuse maps in /public/3d/tex plus crisp
  procedural canvas bump/albedo maps for AeroTex chevron quilting,
  baffle-box duvet stitching, open-cell foam pores, natural latex
  pinholes, and the charcoal GADDA side-band.
*/
import * as THREE from "three";

const texLoader = new THREE.TextureLoader();
const fileCache = new Map<string, THREE.Texture>();
const procCache = new Map<string, THREE.CanvasTexture>();

export function loadPbr(path: string, repeatX = 1, repeatY = 1, isColor = true): THREE.Texture {
  const key = `${path}:${repeatX}:${repeatY}:${isColor ? "s" : "l"}`;
  const hit = fileCache.get(key);
  if (hit) return hit;
  const t = texLoader.load(path);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 4;
  fileCache.set(key, t);
  return t;
}

function makeCanvas(
  key: string,
  size: number,
  draw: (ctx: CanvasRenderingContext2D, s: number) => void,
  repeatX = 1,
  repeatY = 1,
  isColor = true
): THREE.CanvasTexture {
  const fullKey = `${key}:${repeatX}:${repeatY}`;
  const hit = procCache.get(fullKey);
  if (hit) return hit;
  const c = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!c) {
    return new THREE.CanvasTexture(null as unknown as HTMLCanvasElement);
  }
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (ctx) draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  procCache.set(fullKey, t);
  return t;
}

/** Quilted chevron knit bump map inspired by GADDA's real AeroTex cover. */
export function chevronBumpMap(repeatX = 3, repeatY = 4): THREE.CanvasTexture {
  return makeCanvas(
    "chevron-bump",
    256,
    (ctx, s) => {
      ctx.fillStyle = "#c2c2c2";
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = "#686868";
      ctx.lineWidth = 2.8;
      const step = 16;
      for (let y = -s; y < s * 2; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(s * 0.5, y + s * 0.25);
        ctx.lineTo(s, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "#e6e6e6";
      ctx.lineWidth = 1.5;
      for (let y = -s; y < s * 2; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y + 2.5);
        ctx.lineTo(s * 0.5, y + s * 0.25 + 2.5);
        ctx.lineTo(s, y + 2.5);
        ctx.stroke();
      }
    },
    repeatX,
    repeatY,
    false
  );
}

/** Soft baffle-box quilted duvet micro-bump map for believable comforter texture. */
export function duvetQuiltBump(repeatX = 4, repeatY = 5): THREE.CanvasTexture {
  return makeCanvas(
    "duvet-quilt",
    256,
    (ctx, s) => {
      const grad = ctx.createRadialGradient(s * 0.5, s * 0.5, s * 0.08, s * 0.5, s * 0.5, s * 0.72);
      grad.addColorStop(0, "#ededed");
      grad.addColorStop(0.75, "#d2d2d2");
      grad.addColorStop(1, "#909090");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, s, s);

      ctx.strokeStyle = "#6e6e6e";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(2, 2, s - 4, s - 4);
    },
    repeatX,
    repeatY,
    false
  );
}

/** Charcoal woven grid side-band matching the real GADDA mattress border. */
export function gaddaBandMap(repeatX = 6, repeatY = 1): THREE.CanvasTexture {
  return makeCanvas(
    "gadda-band",
    256,
    (ctx, s) => {
      ctx.fillStyle = "#33312f";
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = "rgba(238, 231, 220, 0.16)";
      ctx.lineWidth = 1.5;
      const step = 32;
      for (let i = 0; i <= s; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(s, i);
        ctx.stroke();
      }
    },
    repeatX,
    repeatY,
    true
  );
}

/** Woven GADDA badge label for the front corner of the mattress. */
export function gaddaBadgeMap(): THREE.CanvasTexture {
  return makeCanvas(
    "gadda-badge",
    256,
    (ctx, s) => {
      ctx.fillStyle = "#f4ede2";
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = "#d5cab9";
      ctx.lineWidth = 6;
      ctx.strokeRect(8, 8, s - 16, s - 16);
      ctx.fillStyle = "#23211e";
      ctx.font = "800 54px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("GADDA", 24, s * 0.44);
      ctx.fillStyle = "#e96a32";
      ctx.fillRect(24, s * 0.64, 72, 6);
      ctx.fillStyle = "#6a6258";
      ctx.font = "600 18px system-ui, -apple-system, sans-serif";
      ctx.fillText("THREE MATTRESSES.", 24, s * 0.8);
    },
    1,
    1,
    true
  );
}

/** Open-cell foam micro-pore bump texture (deterministic pseudo-random). */
export function foamPoreBump(repeatX = 4, repeatY = 2): THREE.CanvasTexture {
  return makeCanvas(
    "foam-pores",
    256,
    (ctx, s) => {
      ctx.fillStyle = "#c8c8c8";
      ctx.fillRect(0, 0, s, s);
      let seed = 1337;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      for (let i = 0; i < 1800; i++) {
        const x = rand() * s;
        const y = rand() * s;
        const r = 0.6 + rand() * 1.9;
        const v = Math.floor(70 + rand() * 75);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    repeatX,
    repeatY,
    false
  );
}

/** Natural latex pinhole ventilation pattern. */
export function latexPinholeBump(repeatX = 3, repeatY = 4): THREE.CanvasTexture {
  return makeCanvas(
    "latex-holes",
    256,
    (ctx, s) => {
      ctx.fillStyle = "#d8d8d8";
      ctx.fillRect(0, 0, s, s);
      const step = 24;
      for (let y = 12; y < s; y += step) {
        for (let x = 12; x < s; x += step) {
          const ox = (Math.floor(y / step) % 2) * (step * 0.5);
          ctx.fillStyle = "#484848";
          ctx.beginPath();
          ctx.arc((x + ox) % s, y, 4.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    repeatX,
    repeatY,
    false
  );
}

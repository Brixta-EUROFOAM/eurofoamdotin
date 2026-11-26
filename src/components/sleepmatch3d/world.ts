/*
  GADDA SleepMatch 3D — deterministic world model.

  Every visual quantity on the stage is a pure function of
  (scene, focus, local frame, snapshot of the previous world).
  Nothing animates on its own clock: the Remotion frame is the only input.
*/
import { Euler, MathUtils, Quaternion } from "three";

export type SceneKey = "story" | "heat" | "position" | "feel" | "priority" | "solution";
export type MatchKey = "regular" | "pro" | "ultimate";
export type V3 = [number, number, number];
export type Q4 = [number, number, number, number];

export type StageLayer = { name: string; material: string; kind: string };
export type StageStack = { key: MatchKey; name: string; layers: StageLayer[] };

export type StageInput = {
  scene: SceneKey;
  focus: string | null;
  t0: number;
  from: World | null;
  product: MatchKey;
  stacks: StageStack[];
  roomFirst: boolean;
  reduced: boolean;
  quality: "high" | "low";
};

export type World = {
  bg: V3;
  camPos: V3;
  camTarget: V3;
  fov: number;
  room: number;
  night: number;
  bed: number;
  sleeper: number;
  pose: Record<string, Q4>;
  roll: number;
  lift: number;
  breathe: number;
  blanket: number;
  blanketCover: number;
  blanketSlide: number;
  blanketLift: number;
  mattressRise: number;
  explode: number;
  sink: number;
  heatSurface: number;
  heatBedding: number;
  heatRoom: number;
  layerGlow: number;
  airflow: number;
  windowOpen: number;
  lamp: number;
  stacks: number;
  stackFocus: V3;
  solution: number;
  solutionExplode: number;
  labels: number;
};

/* ---------------------------------------------------------------- poses */

export const POSE_BONES = [
  "Hips", "Spine", "Spine1", "Spine2", "Neck", "Head",
  "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand",
  "RightShoulder", "RightArm", "RightForeArm", "RightHand",
  "LeftUpLeg", "LeftLeg", "LeftFoot", "RightUpLeg", "RightLeg", "RightFoot",
] as const;

type PoseDef = { roll: number; lift: number; bones: Partial<Record<(typeof POSE_BONES)[number], V3>> };

const LEGS_CALM = {
  LeftUpLeg: [-4, 0, 3] as V3,
  RightUpLeg: [-4, 0, -3] as V3,
  LeftLeg: [8, 0, 0] as V3,
  RightLeg: [8, 0, 0] as V3,
  LeftFoot: [26, 0, 0] as V3,
  RightFoot: [26, 0, 0] as V3,
};

const SUPINE: PoseDef = {
  roll: 0,
  lift: 0.088,
  bones: {
    ...LEGS_CALM,
    Spine: [2, 0, 0],
    Neck: [8, 0, 0],
    Head: [4, 4, 0],
    // Canonical T-pose: LeftArm +X -> Z:-76 drops arm cleanly along left side
    LeftArm: [0, -10, -76],
    RightArm: [0, 10, 76],
    LeftForeArm: [0, -18, 0],
    RightForeArm: [0, 18, 0],
  },
};

const RESTLESS: PoseDef = {
  roll: -16,
  lift: 0.092,
  bones: {
    ...LEGS_CALM,
    Spine: [3, 0, 0],
    Spine2: [2, 6, 0],
    Neck: [8, 16, 0],
    Head: [4, 12, 0],
    LeftArm: [0, -24, -68],
    LeftForeArm: [0, -48, 0],
    RightArm: [0, 12, 74],
    RightForeArm: [0, 20, 0],
    LeftUpLeg: [-14, 0, 4],
    LeftLeg: [26, 0, 0],
  },
};

const PUSH: PoseDef = {
  roll: -42,
  lift: 0.105,
  bones: {
    Spine: [4, 0, 2],
    Spine1: [3, 0, 0],
    Spine2: [2, -4, 0],
    Neck: [8, -8, 0],
    Head: [4, -6, 0],
    // Left hand gently resting forward toward duvet edge, right arm resting calmly down
    LeftArm: [0, -36, -62],
    LeftForeArm: [0, -54, 0],
    RightArm: [0, 18, 70],
    RightForeArm: [0, 34, 0],
    LeftUpLeg: [-24, 0, 5],
    LeftLeg: [42, 0, 0],
    RightUpLeg: [-10, 0, -3],
    RightLeg: [18, 0, 0],
    LeftFoot: [22, 0, 0],
    RightFoot: [26, 0, 0],
  },
};

const SIDE: PoseDef = {
  roll: -82,
  lift: 0.135,
  bones: {
    Spine: [6, 0, 0],
    Spine1: [5, 0, 0],
    Spine2: [4, 0, 0],
    Neck: [6, 0, -4],
    Head: [4, 4, 0],
    // Natural comfortable side-sleep: both arms folded gently forward in front of torso/pillow (zero floating)
    LeftArm: [8, -42, -64],
    LeftForeArm: [0, -68, 0],
    RightArm: [6, 34, 66],
    RightForeArm: [0, 62, 0],
    LeftUpLeg: [-28, 0, 2],
    LeftLeg: [44, 0, 0],
    RightUpLeg: [-42, 0, -2],
    RightLeg: [56, 0, 0],
    LeftFoot: [22, 0, 0],
    RightFoot: [22, 0, 0],
  },
};

const PRONE: PoseDef = {
  roll: -180,
  lift: 0.088,
  bones: {
    Spine: [-3, 0, 0],
    Neck: [-4, -38, 0],
    Head: [-2, -18, 0],
    RightArm: [0, 12, 68],
    RightForeArm: [0, 28, 0],
    LeftArm: [0, -12, -68],
    LeftForeArm: [0, -28, 0],
    LeftUpLeg: [-14, -6, 10],
    LeftLeg: [28, 0, 0],
    RightUpLeg: [-4, 0, -3],
    RightLeg: [8, 0, 0],
    LeftFoot: [28, 0, 0],
    RightFoot: [32, 0, 0],
  },
};

function mirror(p: PoseDef): PoseDef {
  const bones: PoseDef["bones"] = {};
  for (const [name, v] of Object.entries(p.bones)) {
    const swapped = name.startsWith("Left")
      ? name.replace("Left", "Right")
      : name.startsWith("Right")
        ? name.replace("Right", "Left")
        : name;
    bones[swapped as keyof PoseDef["bones"]] = [v![0], -v![1], -v![2]];
  }
  return { roll: -p.roll, lift: p.lift, bones };
}
const SIDE_R = mirror(SIDE);

type ResolvedPose = { roll: number; lift: number; q: Record<string, Q4> };
const cache = new Map<PoseDef, ResolvedPose>();
const e = new Euler();
const tq = new Quaternion();
function resolve(p: PoseDef): ResolvedPose {
  const hit = cache.get(p);
  if (hit) return hit;
  const q: Record<string, Q4> = {};
  for (const name of POSE_BONES) {
    const v = p.bones[name] || [0, 0, 0];
    e.set(MathUtils.degToRad(v[0]), MathUtils.degToRad(v[1]), MathUtils.degToRad(v[2]), "YZX");
    tq.setFromEuler(e);
    q[name] = [tq.x, tq.y, tq.z, tq.w];
  }
  const out = { roll: p.roll, lift: p.lift, q };
  cache.set(p, out);
  return out;
}

const qa = new Quaternion();
const qb = new Quaternion();
function slerpPose(a: Record<string, Q4>, b: Record<string, Q4>, t: number): Record<string, Q4> {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const out: Record<string, Q4> = {};
  for (const name of POSE_BONES) {
    qa.set(...a[name]);
    qb.set(...b[name]);
    qa.slerp(qb, t);
    out[name] = [qa.x, qa.y, qa.z, qa.w];
  }
  return out;
}

/* ------------------------------------------------------------- easing */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
export const ease = (v: number) => {
  const t = clamp01(v);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
const win = (f: number, a: number, b: number, c: number, d: number) =>
  ease((f - a) / (b - a)) * (1 - ease((f - c) / (d - c)));
const ramp = (f: number, a: number, b: number) => ease((f - a) / (b - a));

function poseAt(f: number, keys: [number, PoseDef][]): ResolvedPose {
  if (f <= keys[0][0]) return resolve(keys[0][1]);
  for (let i = 0; i < keys.length - 1; i++) {
    const [fa, pa] = keys[i];
    const [fb, pb] = keys[i + 1];
    if (f <= fb) {
      const t = ease((f - fa) / (fb - fa));
      const A = resolve(pa);
      const B = resolve(pb);
      return { roll: lerp(A.roll, B.roll, t), lift: lerp(A.lift, B.lift, t), q: slerpPose(A.q, B.q, t) };
    }
  }
  return resolve(keys[keys.length - 1][1]);
}

/* ------------------------------------------------------------ colours */

export const NIGHT_BG: V3 = [0.115, 0.106, 0.098];
export const STUDIO_BG: V3 = [0.941, 0.918, 0.882];

/* ----------------------------------------------------- base & presets */

function base(): World {
  const p = resolve(SIDE);
  return {
    bg: NIGHT_BG,
    camPos: [2.85, 2.05, 2.95],
    camTarget: [0, 0.48, -0.1],
    fov: 29,
    room: 1,
    night: 1,
    bed: 1,
    sleeper: 1,
    pose: p.q,
    roll: p.roll,
    lift: p.lift,
    breathe: 1,
    blanket: 1,
    blanketCover: 0.52,
    blanketSlide: 0.25,
    blanketLift: 0,
    mattressRise: 0,
    explode: 0,
    sink: 0.45,
    heatSurface: 0.25,
    heatBedding: 0.18,
    heatRoom: 0.08,
    layerGlow: 0,
    airflow: 0,
    windowOpen: 0,
    lamp: 1,
    stacks: 0,
    stackFocus: [0, 0, 0],
    solution: 0,
    solutionExplode: 0,
    labels: 0,
  };
}

function withPose(w: World, p: ResolvedPose): World {
  w.pose = p.q;
  w.roll = p.roll;
  w.lift = p.lift;
  return w;
}

function drift(w: World, f: number, amount = 1): World {
  const a = (f / 30) * 0.22;
  w.camPos = [
    w.camPos[0] + Math.sin(a) * 0.14 * amount,
    w.camPos[1] + Math.sin(a * 0.72) * 0.045 * amount,
    w.camPos[2] - Math.cos(a) * 0.09 * amount,
  ];
  return w;
}

/* --------------------------------------------------------- the scenes */

export const STORY_END = 760;

function story(f: number): World {
  const w = base();
  const pose = poseAt(f, [
    [0, SUPINE],
    [72, SUPINE],
    [132, RESTLESS],
    [164, RESTLESS],
    [214, PUSH],
    [248, PUSH],
    [304, SIDE],
    [700, SIDE],
  ]);
  withPose(w, pose);

  w.blanketCover = lerp(1.0, 0.36, ramp(f, 152, 232));
  w.blanketSlide = lerp(0.0, 0.32, ramp(f, 162, 245));

  const pushIn = ramp(f, 0, 305);
  w.camPos = lerp3([3.25, 2.35, 3.45], [2.05, 1.38, 1.95], pushIn);
  w.camTarget = lerp3([-0.05, 0.44, -0.08], [-0.04, 0.56, -0.22], pushIn);
  w.fov = lerp(31, 28, pushIn);
  drift(w, f, 0.45);

  w.heatBedding = lerp(0.18, 0.72, ramp(f, 24, 156)) * (1 - ramp(f, 215, 305) * 0.45);
  w.heatSurface = lerp(0.28, 0.85, ramp(f, 90, 285));
  w.lamp = 1;

  const u = ramp(f, 330, 410) * (1 - ramp(f, 640, 715));
  if (u > 0) {
    w.room = 1 - u;
    w.night = 1 - u;
    w.bg = lerp3(NIGHT_BG, STUDIO_BG, u);
    w.sleeper = 1 - ramp(f, 335, 375) * (1 - ramp(f, 655, 700));
    w.bed = 1 - u;
    w.mattressRise = u;
    w.explode = ramp(f, 360, 430) * (1 - ramp(f, 630, 690));
    w.blanketLift = u;
    w.blanketCover = lerp(w.blanketCover, 1, u);
    w.blanketSlide = lerp(w.blanketSlide, 0, u);
    w.camPos = lerp3(w.camPos, [2.85, 2.02, 3.0], u);
    w.camTarget = lerp3(w.camTarget, [0, 0.94, 0], u);
    w.fov = lerp(w.fov, 29.5, u);
    w.layerGlow = win(f, 430, 452, 504, 525);
    w.heatBedding = lerp(w.heatBedding, 0, u) + win(f, 512, 534, 582, 602) * 0.88;
    w.heatSurface = lerp(w.heatSurface, 0, u);
    w.airflow = win(f, 585, 608, 640, 670);
    w.labels = win(f, 420, 442, 625, 645);
  }

  const back = ramp(f, 640, STORY_END);
  if (back > 0) {
    const o = heatOverview(f);
    w.camPos = lerp3(w.camPos, o.camPos, back);
    w.camTarget = lerp3(w.camTarget, o.camTarget, back);
    w.fov = lerp(w.fov, o.fov, back);
    w.blanketCover = lerp(w.blanketCover, o.blanketCover, back);
    w.blanketSlide = lerp(w.blanketSlide, o.blanketSlide, back);
    w.heatSurface = lerp(w.heatSurface, o.heatSurface, back);
    w.heatBedding = lerp(w.heatBedding, o.heatBedding, back);
  }
  if (f > STORY_END) return heatOverview(f);
  return w;
}

function heatOverview(f: number): World {
  const w = base();
  w.camPos = [2.85, 2.08, 2.95];
  w.camTarget = [-0.04, 0.48, -0.12];
  w.fov = 29;
  w.heatSurface = 0.45 + 0.15 * Math.sin((f / 30) * 1.1);
  return drift(w, f, 0.8);
}

function heat(focus: string | null, f: number): World {
  const w = heatOverview(f);
  const pulse = 0.5 + 0.5 * Math.sin((f / 30) * 1.35);
  if (focus === "surface") {
    w.blanketCover = 0.18;
    w.blanketSlide = 0.38;
    w.camPos = [1.62, 1.26, 1.18];
    w.camTarget = [-0.02, 0.54, -0.18];
    w.fov = 29;
    w.heatSurface = 0.78 + pulse * 0.22;
    w.heatBedding = 0.08;
    w.sink = 0.55;
    drift(w, f, 0.4);
  } else if (focus === "room") {
    w.blanketCover = 0.94;
    w.blanketSlide = 0.04;
    withPose(w, resolve(SUPINE));
    w.camPos = [3.45, 2.75, 3.55];
    w.camTarget = [-0.32, 0.68, -0.28];
    w.fov = 30.5;
    w.heatBedding = 0.72 + pulse * 0.28;
    w.heatRoom = 0.75;
    w.heatSurface = 0.15;
    w.windowOpen = ramp(f, 10, 65);
    w.airflow = ramp(f, 25, 75);
    drift(w, f, 0.55);
  } else if (focus === "enclosed") {
    w.blanketCover = 0.34;
    w.blanketSlide = 0.28;
    w.camPos = [2.05, 0.82, 0.62];
    w.camTarget = [0, 0.52, -0.16];
    w.fov = 27;
    w.sink = 0.58 + 0.42 * ramp(f, 0, 65);
    w.heatSurface = 0.55 + pulse * 0.2;
    drift(w, f, 0.35);
  } else if (focus === "unsure") {
    const c = ((f / 30) % 9) / 3;
    const i = Math.floor(c);
    w.heatSurface = i === 0 ? 0.85 : 0.2;
    w.heatBedding = i === 1 ? 0.85 : 0.15;
    w.heatRoom = i === 2 ? 0.75 : 0.05;
    w.airflow = i === 2 ? 1 : 0;
    w.windowOpen = i === 2 ? 1 : 0;
    w.blanketCover = 0.58;
    const a = (f / 30) * 0.22;
    w.camPos = [Math.cos(a) * 3.1 + 0.2, 2.2, Math.sin(a) * 1.1 + 2.9];
  }
  return w;
}

const POS_FOCUS: Record<string, PoseDef> = { side: SIDE, back: SUPINE, stomach: PRONE };

function position(focus: string | null, f: number): World {
  const w = base();
  w.blanket = 0;
  w.blanketCover = 0;
  w.blanketSlide = 0;
  w.heatSurface = 0.22;
  w.heatBedding = 0;
  w.camPos = [1.75, 2.65, 1.75];
  w.camTarget = [0, 0.5, -0.08];
  w.fov = 30;
  if (focus && POS_FOCUS[focus]) {
    withPose(w, resolve(POS_FOCUS[focus]));
  } else {
    const cyc = f % 480;
    withPose(
      w,
      poseAt(cyc, [
        [0, SIDE],
        [90, SIDE],
        [140, SUPINE],
        [210, SUPINE],
        [260, SIDE_R],
        [330, SIDE_R],
        [380, SUPINE],
        [430, SUPINE],
        [480, SIDE],
      ])
    );
  }
  w.sink = 0.48;
  return drift(w, f, 0.5);
}

const FEEL: Record<string, number> = { firm: 0.12, balanced: 0.5, plush: 0.95 };

function feel(focus: string | null, f: number): World {
  const w = base();
  w.blanket = 0;
  w.blanketCover = 0;
  w.blanketSlide = 0;
  w.heatSurface = 0.15;
  w.heatBedding = 0;
  w.camPos = [2.35, 0.88, 0.25];
  w.camTarget = [0, 0.52, -0.08];
  w.fov = 26;
  if (focus && focus in FEEL) w.sink = FEEL[focus];
  else {
    const c = (f % 360) / 120;
    const a = [0.12, 0.5, 0.95][Math.floor(c) % 3];
    const b = [0.5, 0.95, 0.12][Math.floor(c) % 3];
    w.sink = lerp(a, b, ease(((c % 1) - 0.65) / 0.35));
  }
  return drift(w, f, 0.3);
}

const PRIORITY: Record<string, number> = { essential: 0, everyday: 1, premium: 2 };

function priority(focus: string | null, f: number): World {
  const w = base();
  w.room = 0;
  w.night = 0;
  w.bg = STUDIO_BG;
  w.bed = 0;
  w.sleeper = 0;
  w.blanket = 0;
  w.stacks = 1;
  w.lamp = 0;
  w.heatSurface = 0;
  w.heatBedding = 0;
  w.camPos = [0.35, 2.15, 4.35];
  w.camTarget = [0, 0.55, 0];
  w.fov = 30;
  const i = focus && focus in PRIORITY ? PRIORITY[focus] : -1;
  w.stackFocus = [0, 1, 2].map((k) => (k === i ? 1 : 0)) as V3;
  w.labels = 1;
  return drift(w, f, 0.45);
}

function solution(input: StageInput, f: number): World {
  const w = base();
  w.room = 0;
  w.night = 0;
  w.bg = STUDIO_BG;
  w.bed = 0;
  w.sleeper = 0;
  w.lamp = 0;
  w.blanket = input.roomFirst ? 1 : 0;
  w.blanketLift = 1;
  w.blanketCover = 1;
  w.blanketSlide = 0;
  w.heatSurface = 0;
  w.heatBedding = input.roomFirst ? 0.32 : 0;
  w.airflow = input.roomFirst ? 0.8 : 0;
  w.solution = 1;
  w.solutionExplode = ramp(f, 12, 80);
  w.labels = ramp(f, 60, 90);
  w.camPos = [2.65, 2.0, 2.75];
  w.camTarget = [0, 0.95, 0];
  w.fov = 29;
  return drift(w, f, 0.6);
}

export function target(input: StageInput, f: number): World {
  switch (input.scene) {
    case "story":
      return story(f);
    case "heat":
      return heat(input.focus, f);
    case "position":
      return position(input.focus, f);
    case "feel":
      return feel(input.focus, f);
    case "priority":
      return priority(input.focus, f);
    case "solution":
      return solution(input, f);
  }
}

/* ------------------------------------------------------- transitions */

export const TRANSITION = 42;

export function mix(a: World, b: World, t: number): World {
  if (t >= 1) return b;
  const out = { ...b };
  for (const k of Object.keys(b) as (keyof World)[]) {
    const av = a[k] as unknown;
    const bv = b[k] as unknown;
    if (typeof bv === "number" && typeof av === "number") (out[k] as number) = lerp(av, bv, t);
    else if (Array.isArray(bv) && Array.isArray(av))
      (out[k] as unknown as V3) = lerp3(av as V3, bv as V3, t);
  }
  out.pose = slerpPose(a.pose, b.pose, t);
  return out;
}

export function worldAt(input: StageInput, absFrame: number): World {
  const local = input.reduced ? 150 : Math.max(0, absFrame - input.t0);
  const goal = target(input, local);
  if (!input.from || input.reduced) return goal;
  return mix(input.from, goal, ease(local / TRANSITION));
}

/* ----------------------------------------------------------- captions */

export type Caption = { kicker: string; line: string; opacity: number };

export function captionAt(input: StageInput, absFrame: number): Caption | null {
  const f = input.reduced ? 150 : Math.max(0, absFrame - input.t0);
  if (input.scene === "story") {
    const list: [number, number, string, string][] = [
      [16, 150, "01 · Recognition", "It's late. Warmth builds under the covers."],
      [160, 318, "01 · Recognition", "Duvet pushed back. The surface still holds warmth."],
      [372, 450, "02 · Understanding", "Heat can come from more than one place."],
      [450, 522, "Comfort layers", "Some foams hold closer to the body. Some sleepers notice that as warmth."],
      [522, 596, "Bedding", "Heavy or synthetic covers can hold warmth around you."],
      [596, 660, "The room", "Room temperature and airflow matter as much as what you sleep on."],
      [STORY_END - 20, 99999, "03 · Your turn", "Where do you notice the heat?"],
    ];
    for (const [a, b, kicker, line] of list) {
      if (f >= a && f < b)
        return {
          kicker,
          line,
          opacity: win(f, a, a + 14, b - 14, b) || (b === 99999 ? ramp(f, a, a + 14) : 0),
        };
    }
    return null;
  }
  const o = ramp(f, 8, 26);
  const map: Record<string, Record<string, [string, string]>> = {
    heat: {
      _: ["03 · The heat", "Where do you notice the heat?"],
      surface: ["Where you touch the bed", "Warmth that builds where your body meets the surface."],
      room: ["Around you", "Covers, room temperature and airflow. Not always the mattress."],
      enclosed: ["Sinking in", "A deep, close-hugging surface can feel more enclosed."],
      unsure: ["Not sure yet", "Surface, bedding or room. We'll weigh them together."],
    },
    position: {
      _: ["04 · You", "Most people move through several positions a night."],
      side: ["Side", "Shoulders and hips carry the load."],
      back: ["Back", "Weight spreads more evenly."],
      stomach: ["Stomach", "Hips tend to press in deepest."],
      combo: ["All of the above", "Side. Back. Side again."],
    },
    feel: {
      _: ["04 · Feel", "Conceptual illustration of how far you settle in."],
      firm: ["Steady", "You lie more on top of the surface."],
      balanced: ["Balanced", "Some give, with support underneath."],
      plush: ["Cushioned", "You settle deeper into the comfort layers."],
    },
    priority: {
      _: ["04 · Worth it", "Three builds. Different materials. Different prices."],
      essential: ["Essentials", "A straightforward two-foam build."],
      everyday: ["Balance", "Memory foam over a responsive base."],
      premium: ["Premium layers", "More comfort layers, higher price."],
    },
    solution: { _: ["05 · Your match", "Built from the published construction."] },
  };
  const m = map[input.scene];
  const key = input.focus && m[input.focus] ? input.focus : "_";
  return { kicker: m[key][0], line: m[key][1], opacity: o };
}

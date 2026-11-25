/**
 * Procedural ORIEL body geometry — pure math, no three.js dependency.
 *
 * Coordinate system: X = length (front is +X), Y = up, Z = width.
 * The body and the glass canopy are lofted from superellipse cross-sections
 * whose size is driven by hand-tuned spline profiles. This keeps the whole
 * car in code (no external 3D model needed) and lets the 2D drawings on the
 * page (blueprint, fallback silhouette, top-view schematic) share the exact
 * same proportions as the 3D scene.
 */

export const CAR_LENGTH = 4.6;
export const BODY_X0 = -CAR_LENGTH / 2;
export const xAt = (t: number): number => BODY_X0 + t * CAR_LENGTH;

export const WHEEL_RADIUS = 0.352;
export const FRONT_AXLE_X = 1.42;
export const REAR_AXLE_X = -1.38;
export const FRONT_AXLE_Z = 0.82;
export const REAR_AXLE_Z = 0.88;

type Knot = readonly [number, number];
export type Vec3 = [number, number, number];

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, u: number): number => a + (b - a) * u;
const sgnPow = (v: number, p: number): number => Math.sign(v) * Math.pow(Math.abs(v), p);

/** Cubic Hermite through knots with Catmull-Rom tangents (non-uniform spacing). */
function hermite(knots: readonly Knot[], t: number): number {
  const n = knots.length;
  if (t <= knots[0][0]) return knots[0][1];
  if (t >= knots[n - 1][0]) return knots[n - 1][1];
  let i = 0;
  while (i < n - 2 && t > knots[i + 1][0]) i++;
  const tangent = (k: number): number => {
    if (k === 0) return (knots[1][1] - knots[0][1]) / (knots[1][0] - knots[0][0]);
    if (k === n - 1) return (knots[n - 1][1] - knots[n - 2][1]) / (knots[n - 1][0] - knots[n - 2][0]);
    return (knots[k + 1][1] - knots[k - 1][1]) / (knots[k + 1][0] - knots[k - 1][0]);
  };
  const [t0, y0] = knots[i];
  const [t1, y1] = knots[i + 1];
  const h = t1 - t0;
  const u = (t - t0) / h;
  const m0 = tangent(i) * h;
  const m1 = tangent(i + 1) * h;
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * y0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * y1 + (u3 - u2) * m1;
}

/* ---------- Profiles (t = 0 rear → 1 front) ---------- */

const WIDTH: Knot[] = [
  [0, 0.55], [0.05, 0.82], [0.18, 0.98], [0.36, 0.97], [0.5, 0.93],
  [0.66, 0.96], [0.84, 0.93], [0.95, 0.78], [1, 0.52],
];
const TOP: Knot[] = [
  [0, 0.58], [0.05, 0.72], [0.2, 0.84], [0.38, 0.8], [0.58, 0.7],
  [0.8, 0.57], [0.94, 0.48], [1, 0.4],
];
const BOTTOM: Knot[] = [
  [0, 0.3], [0.05, 0.24], [0.18, 0.2], [0.5, 0.19], [0.84, 0.19], [0.95, 0.16], [1, 0.18],
];

const CAN_T0 = 0.27;
const CAN_T1 = 0.74;
const CAN_TOP: Knot[] = [
  [CAN_T0, 0.8], [0.34, 0.93], [0.45, 1.04], [0.56, 1.05], [0.66, 0.93], [CAN_T1, 0.68],
];
const CAN_W: Knot[] = [
  [CAN_T0, 0.4], [0.34, 0.64], [0.46, 0.72], [0.58, 0.68], [0.68, 0.52], [CAN_T1, 0.3],
];

const REAR_CAP = 0.06;
const FRONT_CAP = 0.11;

/** Circular end cap: 0 at the tip, 1 once `s` reaches 1. */
const capFactor = (s: number): number => {
  const k = clamp01(s);
  return Math.sqrt(1 - (1 - k) * (1 - k));
};

export interface Section {
  ym: number; // vertical centre of the cross-section
  hw: number; // half width
  hh: number; // half height
  n: number; // superellipse exponent (2 = ellipse, higher = boxier)
}

export function bodySection(t: number): Section {
  const c = capFactor(Math.min(t / REAR_CAP, (1 - t) / FRONT_CAP));
  const top = hermite(TOP, t);
  const bot = hermite(BOTTOM, t);
  return {
    ym: (top + bot) / 2,
    hw: hermite(WIDTH, t) * c,
    hh: Math.max(((top - bot) / 2) * c, 1e-4),
    n: 2.9,
  };
}

export function canopySection(t: number): Section {
  const u = (t - CAN_T0) / (CAN_T1 - CAN_T0);
  const c = capFactor(Math.min(u / 0.22, (1 - u) / 0.3));
  const top = hermite(CAN_TOP, t);
  const bot = hermite(TOP, t) - 0.22;
  return {
    ym: (top + bot) / 2,
    hw: hermite(CAN_W, t) * c,
    hh: Math.max(((top - bot) / 2) * c, 1e-4),
    n: 2.5,
  };
}

/** Height of the upper body surface at station t and lateral offset z. */
export function upperSurfaceY(t: number, z: number): number {
  const s = bodySection(t);
  const r = Math.min(Math.abs(z) / Math.max(s.hw, 1e-4), 0.999);
  return s.ym + s.hh * Math.pow(1 - Math.pow(r, s.n), 1 / s.n);
}

/* ---------- Lofting ---------- */

export interface LoftData {
  positions: Float32Array;
  indices: Uint32Array;
}

function loft(stations: { x: number; s: Section }[], ringCount = 56): LoftData {
  const N = stations.length;
  const M = ringCount;
  const positions = new Float32Array(N * M * 3);
  for (let i = 0; i < N; i++) {
    const { x, s } = stations[i];
    for (let k = 0; k < M; k++) {
      const th = (k / M) * Math.PI * 2;
      const c = Math.cos(th);
      const sn = Math.sin(th);
      const p = (i * M + k) * 3;
      positions[p] = x;
      positions[p + 1] = s.ym + s.hh * sgnPow(sn, 2 / s.n);
      positions[p + 2] = s.hw * sgnPow(c, 2 / s.n);
    }
  }
  const indices = new Uint32Array((N - 1) * M * 6);
  let w = 0;
  for (let i = 0; i < N - 1; i++) {
    for (let k = 0; k < M; k++) {
      const a = i * M + k;
      const b = i * M + ((k + 1) % M);
      const c = (i + 1) * M + k;
      const d = (i + 1) * M + ((k + 1) % M);
      indices[w++] = a;
      indices[w++] = c;
      indices[w++] = b;
      indices[w++] = b;
      indices[w++] = c;
      indices[w++] = d;
    }
  }
  if (signedVolume(positions, indices) < 0) {
    for (let i = 0; i < indices.length; i += 3) {
      const tmp = indices[i + 1];
      indices[i + 1] = indices[i + 2];
      indices[i + 2] = tmp;
    }
  }
  return { positions, indices };
}

export function signedVolume(positions: Float32Array, indices: Uint32Array): number {
  let v = 0;
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3;
    const b = indices[i + 1] * 3;
    const c = indices[i + 2] * 3;
    const ax = positions[a], ay = positions[a + 1], az = positions[a + 2];
    const bx = positions[b], by = positions[b + 1], bz = positions[b + 2];
    const cx = positions[c], cy = positions[c + 1], cz = positions[c + 2];
    v += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
  }
  return v;
}

/** Cosine-spaced samples: dense near the ends where curvature is highest. */
const cosineSpace = (a: number, b: number, count: number): number[] =>
  Array.from({ length: count }, (_, i) => a + (b - a) * (0.5 - 0.5 * Math.cos((Math.PI * i) / (count - 1))));

export function buildBodyLoft(): LoftData {
  const stations = cosineSpace(0, 1, 170).map((t) => ({ x: xAt(t), s: bodySection(t) }));
  return loft(stations);
}

export function buildCanopyLoft(): LoftData {
  const stations = cosineSpace(CAN_T0, CAN_T1, 90).map((t) => ({ x: xAt(t), s: canopySection(t) }));
  return loft(stations, 48);
}

/* ---------- Detail curves ---------- */

/** Slim daytime-running-light blade, swept back over the front corner. */
export function frontLampPoints(side: 1 | -1): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14;
    const t = lerp(0.956, 0.905, u);
    const z = lerp(0.24, 0.8, u);
    pts.push([xAt(t), upperSurfaceY(t, z) - 0.012, z * side]);
  }
  return pts;
}

/** Full-width rear light bar. */
export function rearLampPoints(): Vec3[] {
  const pts: Vec3[] = [];
  const t = 0.068;
  for (let i = 0; i <= 20; i++) {
    const z = lerp(-0.74, 0.74, i / 20);
    pts.push([xAt(t), upperSurfaceY(t, z) - 0.03, z]);
  }
  return pts;
}

/** Gold pinstripe tracing the widest line of the body. */
export function pinstripePoints(side: 1 | -1): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = lerp(0.2, 0.86, i / 40);
    const s = bodySection(t);
    pts.push([xAt(t), s.ym, (s.hw + 0.003) * side]);
  }
  return pts;
}

/* ---------- 2D drawings that share the 3D proportions ---------- */

export interface Silhouette {
  upper: [number, number][];
  lower: [number, number][];
}

/** Side silhouette (x along the car, y up). */
export function sideSilhouette(samples = 160): Silhouette {
  const upper: [number, number][] = [];
  const lower: [number, number][] = [];
  for (const t of cosineSpace(0, 1, samples)) {
    const b = bodySection(t);
    let top = b.ym + b.hh;
    if (t > CAN_T0 && t < CAN_T1) {
      const c = canopySection(t);
      top = Math.max(top, c.ym + c.hh);
    }
    upper.push([xAt(t), top]);
    lower.push([xAt(t), b.ym - b.hh]);
  }
  return { upper, lower };
}

/** Top-down outline (x along the car, z across). Returns the +z half. */
export function topOutline(samples = 140): [number, number][] {
  return cosineSpace(0, 1, samples).map((t) => [xAt(t), bodySection(t).hw] as [number, number]);
}

export const PROFILE_STATS = {
  length: CAR_LENGTH,
  wheelbase: FRONT_AXLE_X - REAR_AXLE_X,
};

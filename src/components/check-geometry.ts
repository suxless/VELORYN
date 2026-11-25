/**
 * Sanity checks for the procedural body geometry (pure math, runs without three.js).
 * Run: npm run check:geometry
 */
import {
  buildBodyLoft,
  buildCanopyLoft,
  signedVolume,
  sideSilhouette,
  topOutline,
  frontLampPoints,
  rearLampPoints,
  pinstripePoints,
  CAR_LENGTH,
} from "../src/lib/carGeometry";

let failed = 0;
const assert = (cond: boolean, msg: string) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`);
  if (!cond) failed++;
};

function bounds(p: Float32Array) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < p.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      min[a] = Math.min(min[a], p[i + a]);
      max[a] = Math.max(max[a], p[i + a]);
    }
  }
  return { min, max };
}

for (const [name, data] of [
  ["body", buildBodyLoft()],
  ["canopy", buildCanopyLoft()],
] as const) {
  const finite = data.positions.every(Number.isFinite);
  const maxIndex = data.indices.reduce((m, v) => Math.max(m, v), 0);
  const vol = signedVolume(data.positions, data.indices);
  const b = bounds(data.positions);
  console.log(
    `${name}: ${data.positions.length / 3} vertices, ${data.indices.length / 3} triangles, ` +
      `size ${(b.max[0] - b.min[0]).toFixed(2)} x ${(b.max[1] - b.min[1]).toFixed(2)} x ${(b.max[2] - b.min[2]).toFixed(2)}`
  );
  assert(finite, `${name}: all vertex positions are finite`);
  assert(maxIndex < data.positions.length / 3, `${name}: indices are in range`);
  assert(vol > 0, `${name}: winding is outward (volume ${vol.toFixed(3)} m³ > 0)`);
  if (name === "body") {
    assert(Math.abs(b.max[0] - b.min[0] - CAR_LENGTH) < 0.01, "body: length matches CAR_LENGTH");
    assert(b.max[2] > 0.9 && b.max[2] < 1.05, "body: half width in expected range");
    assert(b.max[1] > 0.75 && b.max[1] < 0.95, "body: deck height in expected range");
    assert(b.min[1] > 0.1, "body: sits above the ground plane");
  } else {
    assert(b.max[1] > 0.95 && b.max[1] < 1.15, "canopy: roof height in expected range");
    assert(b.max[2] < 0.8, "canopy: narrower than body");
  }
}

const sil = sideSilhouette();
const roof = Math.max(...sil.upper.map((p) => p[1]));
assert(roof > 0.95 && roof < 1.15, `side silhouette roof height ${roof.toFixed(3)} m`);
assert(sil.upper.every((p) => Number.isFinite(p[0]) && Number.isFinite(p[1])), "silhouette values are finite");
assert(topOutline().every((p) => Number.isFinite(p[1]) && p[1] >= 0), "top outline values are finite");

for (const [n, pts] of [
  ["front lamp", frontLampPoints(1)],
  ["rear lamp", rearLampPoints()],
  ["pinstripe", pinstripePoints(1)],
] as const) {
  assert(pts.every((p) => p.every(Number.isFinite)), `${n}: curve points are finite`);
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll geometry checks passed.");

import { sideSilhouette, FRONT_AXLE_X, REAR_AXLE_X, WHEEL_RADIUS } from "@/lib/carGeometry";

/** Line-drawn side profile: loading state and fallback when WebGL is unavailable. */
export function CarSilhouette({ className = "" }: { className?: string }) {
  const { upper, lower } = sideSilhouette(120);
  const s = 100; // px per metre
  const ox = 240;
  const gy = 190;
  const pt = ([x, y]: [number, number]) => `${(ox + x * s).toFixed(1)},${(gy - y * s).toFixed(1)}`;
  const d = `M${upper.map(pt).join(" L")} L${[...lower].reverse().map(pt).join(" L")} Z`;
  return (
    <svg viewBox="0 0 480 220" className={className} fill="none" role="img" aria-label="ORIEL side profile">
      <line x1="10" x2="470" y1={gy} y2={gy} stroke="#D4B46A" strokeOpacity="0.35" />
      <path d={d} stroke="#EADFC4" strokeWidth="1.4" fill="#0B4A3A" fillOpacity="0.55" />
      {[FRONT_AXLE_X, REAR_AXLE_X].map((x) => (
        <g key={x}>
          <circle cx={ox + x * s} cy={gy - WHEEL_RADIUS * s} r={WHEEL_RADIUS * s} stroke="#EADFC4" strokeWidth="1.4" fill="#082A24" />
          <circle cx={ox + x * s} cy={gy - WHEEL_RADIUS * s} r={WHEEL_RADIUS * s * 0.62} stroke="#D4B46A" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}

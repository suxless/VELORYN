"use client";

import { Reveal } from "./Reveal";
import { useInView } from "./hooks";
import { TECH } from "@/lib/data";
import { topOutline, FRONT_AXLE_X, REAR_AXLE_X, FRONT_AXLE_Z, REAR_AXLE_Z } from "@/lib/carGeometry";

/* Top-down chassis schematic. Nose points right; same outline as the 3D body. */
function Chassis() {
  const [ref, inView] = useInView<SVGSVGElement>(0.25);
  const half = topOutline(140);
  const S = 172;
  const OX = 460;
  const OY = 230;
  const px = (x: number) => OX + x * S;
  const pz = (z: number) => OY + z * S;
  const outline = `M${half.map(([x, z]) => `${px(x).toFixed(1)},${pz(-z).toFixed(1)}`).join(" L")} L${[...half]
    .reverse()
    .map(([x, z]) => `${px(x).toFixed(1)},${pz(z).toFixed(1)}`)
    .join(" L")} Z`;

  const motors: [number, number][] = [
    [FRONT_AXLE_X, FRONT_AXLE_Z],
    [FRONT_AXLE_X, -FRONT_AXLE_Z],
    [REAR_AXLE_X, REAR_AXLE_Z],
    [REAR_AXLE_X, -REAR_AXLE_Z],
  ];
  const battery = { x0: -0.95, x1: 0.95, z: 0.5 };
  const cells = 8;

  return (
    <svg
      ref={ref}
      viewBox="0 0 920 460"
      className="w-full"
      role="img"
      aria-label="Top-down schematic of the ORIEL showing the central battery pack and four wheel motors."
    >
      <g style={{ opacity: inView ? 1 : 0, transition: "opacity 1.2s ease" }}>
        <path d={outline} fill="#0B4A3A" fillOpacity="0.4" stroke="#EADFC4" strokeWidth="1.5" />

        {/* battery pack */}
        <rect
          x={px(battery.x0)}
          y={pz(-battery.z)}
          width={(battery.x1 - battery.x0) * S}
          height={battery.z * 2 * S}
          fill="#082A24"
          stroke="#D4B46A"
          strokeWidth="1.2"
        />
        {Array.from({ length: cells - 1 }, (_, i) => {
          const x = px(battery.x0 + ((i + 1) / cells) * (battery.x1 - battery.x0));
          return <line key={i} x1={x} x2={x} y1={pz(-battery.z)} y2={pz(battery.z)} stroke="#D4B46A" strokeOpacity="0.35" />;
        })}
        <line x1={px(battery.x0)} x2={px(battery.x1)} y1={OY} y2={OY} stroke="#D4B46A" strokeOpacity="0.35" />
        <text x={px(0)} y={OY + 5} textAnchor="middle" fill="#D4B46A" fontSize="11" fontFamily="var(--font-mono)" letterSpacing="3">
          118 KWH · 900 V
        </text>

        {/* power lines battery → motors */}
        {motors.map(([x, z], i) => {
          const sx = x > 0 ? battery.x1 : battery.x0;
          const sz = z > 0 ? 0.3 : -0.3;
          return (
            <path
              key={i}
              d={`M${px(sx)},${pz(sz)} L${px(x)},${pz(sz)} L${px(x)},${pz(z)}`}
              fill="none"
              stroke="#64DCC0"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              style={{ animation: "flow 1.4s linear infinite" }}
            />
          );
        })}

        {/* wheels + motors */}
        {motors.map(([x, z], i) => (
          <g key={i}>
            <rect x={px(x) - 0.352 * S} y={pz(z) - 0.15 * S} width={0.704 * S} height={0.3 * S} rx="6" fill="#06201A" stroke="#EADFC4" strokeOpacity="0.8" />
            <circle
              cx={px(x)}
              cy={pz(z)}
              r="15"
              fill="#06362B"
              stroke="#64DCC0"
              strokeWidth="1.6"
              style={{ animation: "pulse-ring 2.4s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}
            />
            <circle cx={px(x)} cy={pz(z)} r="4" fill="#64DCC0" />
          </g>
        ))}

        {/* annotations */}
        <g fill="#AAC4B5" fontSize="11" fontFamily="var(--font-mono)" letterSpacing="2">
          <text x={px(FRONT_AXLE_X)} y={pz(-FRONT_AXLE_Z) - 40} textAnchor="middle">
            MOTOR 1–4 · 478 HP EACH
          </text>
          <text x={px(-2.3)} y={OY + 205} fill="#D4B46A">
            ← REAR
          </text>
          <text x={px(2.3)} y={OY + 205} textAnchor="end" fill="#D4B46A">
            FRONT →
          </text>
        </g>
      </g>
    </svg>
  );
}

export function Technology() {
  return (
    <section id="technology" className="relative border-t border-vel-gold/15 bg-vel-emerald">
      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-y-14 px-5 py-28 lg:gap-x-10 lg:px-10 lg:py-40">
        <div className="col-span-12 lg:col-span-5">
          <p className="label label-gold">04 — Technology</p>
          <Reveal as="h2" className="mt-6 font-display text-4xl font-light leading-[1.05] lg:text-6xl">
            Engineered <br />
            around the pack.
          </Reveal>
          <dl className="mt-12 border-t border-vel-gold/20">
            {TECH.map((t, i) => (
              <Reveal key={t.term} delay={i * 90} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-vel-gold/20 py-5 lg:grid-cols-[8.5rem_1fr]">
                <dt className="label label-gold pt-1">{t.term}</dt>
                <dd className="text-sm leading-relaxed text-vel-sage lg:text-base">{t.text}</dd>
              </Reveal>
            ))}
          </dl>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <div className="border border-vel-gold/20 bg-vel-pine/60 p-4 lg:p-8">
            <div className="mb-4 flex items-baseline justify-between">
              <p className="label">Fig. 04 — Architecture, plan view</p>
              <p className="label label-gold">Live schematic</p>
            </div>
            <Chassis />
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Reveal } from "./Reveal";
import { CountUp } from "./CountUp";
import { useInView } from "./hooks";
import { PERFORMANCE } from "@/lib/data";

/* Power and torque against road speed (normalised 0–1). Purely illustrative. */
const W = 800;
const H = 300;
const PAD = { l: 44, r: 16, t: 16, b: 36 };
const curve = (fn: (kmh: number) => number): string => {
  const pts: string[] = [];
  for (let kmh = 0; kmh <= 400; kmh += 5) {
    const x = PAD.l + (kmh / 400) * (W - PAD.l - PAD.r);
    const y = PAD.t + (1 - fn(kmh)) * (H - PAD.t - PAD.b);
    pts.push(`${pts.length ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
};
const POWER = curve((v) => (1 - Math.exp(-v / 38)) * (1 - 0.28 * Math.pow(v / 400, 3)));
const TORQUE = curve((v) => Math.exp(-Math.pow(v / 300, 2.1)));

function PowerCurve() {
  const [ref, inView] = useInView<SVGSVGElement>(0.3);
  const draw = (delay: number) => ({
    strokeDasharray: 1,
    strokeDashoffset: inView ? 0 : 1,
    transition: `stroke-dashoffset 2.2s cubic-bezier(.3,.7,.2,1) ${delay}ms`,
  });
  return (
    <div className="overflow-x-auto">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="min-w-[640px] w-full"
        role="img"
        aria-label="Power and torque curves against road speed, from 0 to 400 kilometres per hour."
      >
        {[0, 0.25, 0.5, 0.75, 1].map((g) => {
          const y = PAD.t + g * (H - PAD.t - PAD.b);
          return <line key={g} x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#D4B46A" strokeOpacity="0.14" />;
        })}
        {[0, 100, 200, 300, 400].map((v) => {
          const x = PAD.l + (v / 400) * (W - PAD.l - PAD.r);
          return (
            <g key={v}>
              <line x1={x} x2={x} y1={PAD.t} y2={H - PAD.b} stroke="#D4B46A" strokeOpacity="0.14" />
              <text x={x} y={H - 12} textAnchor="middle" fill="#AAC4B5" fontSize="11" fontFamily="var(--font-mono)">
                {v}
              </text>
            </g>
          );
        })}
        <text x={PAD.l} y={H - 0} fill="#AAC4B5" fontSize="10" fontFamily="var(--font-mono)" letterSpacing="2">
          KM/H
        </text>
        <path d={TORQUE} pathLength={1} fill="none" stroke="#64DCC0" strokeWidth="2" style={draw(300)} />
        <path d={POWER} pathLength={1} fill="none" stroke="#D4B46A" strokeWidth="2.5" style={draw(0)} />
        <g fontSize="11" fontFamily="var(--font-mono)" letterSpacing="2">
          <text x={W - 150} y={PAD.t + 14} fill="#D4B46A">
            ● POWER
          </text>
          <text x={W - 150} y={PAD.t + 32} fill="#64DCC0">
            ● TORQUE
          </text>
        </g>
      </svg>
    </div>
  );
}

export function Performance() {
  return (
    <section id="performance" className="relative border-t border-vel-gold/15 bg-vel-emerald">
      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-y-14 px-5 py-28 lg:gap-x-10 lg:px-10 lg:py-40">
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="label label-gold">02 — Performance</p>
            <Reveal as="h2" className="mt-6 font-display text-4xl font-light leading-[1.05] lg:text-6xl">
              Measured, <br />
              not shouted.
            </Reveal>
            <Reveal delay={150} as="p" className="mt-6 max-w-sm leading-relaxed text-vel-sage">
              Output is delivered the same way at every speed: instantly, evenly and with no drama in the cabin. The
              numbers speak for themselves.
            </Reveal>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <ul className="border-t border-vel-gold/20">
            {PERFORMANCE.map((p, i) => (
              <Reveal as="li" key={p.label} delay={i * 80} className="border-b border-vel-gold/20">
                <div className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1 py-6 sm:grid-cols-[1fr_auto] lg:py-8">
                  <div>
                    <p className="label">{p.label}</p>
                    <p className="mt-1 text-sm text-vel-sage/80">{p.note}</p>
                  </div>
                  <p className="font-display text-5xl font-light leading-none sm:text-right lg:text-7xl">
                    <CountUp to={p.to} decimals={p.decimals} />
                    <span className="ml-2 font-mono text-sm tracking-widest text-vel-gold">{p.unit}</span>
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>

          <div className="mt-14">
            <div className="mb-4 flex items-baseline justify-between">
              <p className="label">Fig. 02 — Output against speed</p>
              <p className="label label-gold">Illustrative</p>
            </div>
            <PowerCurve />
          </div>
        </div>
      </div>
    </section>
  );
}

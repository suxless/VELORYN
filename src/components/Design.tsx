"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { useInView } from "./hooks";
import { MATERIALS } from "@/lib/data";
import {
  sideSilhouette,
  CAR_LENGTH,
  FRONT_AXLE_X,
  REAR_AXLE_X,
  WHEEL_RADIUS,
} from "@/lib/carGeometry";

/* ---- Blueprint: drawn from the same profile curves as the 3D model ---- */
function Blueprint() {
  const [ref, inView] = useInView<SVGSVGElement>(0.25);
  const { upper, lower } = sideSilhouette(160);
  const S = 205; // px per metre
  const OX = 600;
  const GY = 360;
  const pt = ([x, y]: [number, number]) => `${(OX + x * S).toFixed(1)},${(GY - y * S).toFixed(1)}`;
  const outline = `M${upper.map(pt).join(" L")} L${[...lower].reverse().map(pt).join(" L")} Z`;
  const roof = Math.max(...upper.map((p) => p[1]));
  const xL = OX - (CAR_LENGTH / 2) * S;
  const xR = OX + (CAR_LENGTH / 2) * S;
  const axF = OX + FRONT_AXLE_X * S;
  const axR = OX + REAR_AXLE_X * S;
  const dim = { stroke: "#D4B46A", strokeOpacity: 0.7, strokeWidth: 1 } as const;
  const txt = { fill: "#D4B46A", fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: 2 } as const;

  return (
    <div className="overflow-x-auto">
      <svg
        ref={ref}
        viewBox="0 0 1200 440"
        className="min-w-[820px] w-full"
        role="img"
        aria-label="Technical side drawing of the ORIEL with length, wheelbase and height dimensions."
      >
        <line x1="60" x2="1140" y1={GY} y2={GY} stroke="#D4B46A" strokeOpacity="0.3" />
        <path
          d={outline}
          pathLength={1}
          fill="#0B4A3A"
          fillOpacity={inView ? 0.45 : 0}
          stroke="#EADFC4"
          strokeWidth="1.6"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: inView ? 0 : 1,
            transition: "stroke-dashoffset 2.6s cubic-bezier(.3,.7,.2,1), fill-opacity 1.4s ease 1.6s",
          }}
        />
        {[axF, axR].map((x) => (
          <g key={x} style={{ opacity: inView ? 1 : 0, transition: "opacity 1s ease 1.4s" }}>
            <circle cx={x} cy={GY - WHEEL_RADIUS * S} r={WHEEL_RADIUS * S} fill="#082A24" stroke="#EADFC4" strokeWidth="1.6" />
            <circle cx={x} cy={GY - WHEEL_RADIUS * S} r={WHEEL_RADIUS * S * 0.64} fill="none" stroke="#D4B46A" />
            <circle cx={x} cy={GY - WHEEL_RADIUS * S} r="5" fill="#D4B46A" />
          </g>
        ))}

        <g style={{ opacity: inView ? 1 : 0, transition: "opacity 1s ease 2s" }}>
          {/* overall length */}
          <line x1={xL} x2={xR} y1={GY + 44} y2={GY + 44} {...dim} />
          <line x1={xL} x2={xL} y1={GY + 34} y2={GY + 54} {...dim} />
          <line x1={xR} x2={xR} y1={GY + 34} y2={GY + 54} {...dim} />
          <text x={OX} y={GY + 66} textAnchor="middle" {...txt}>
            LENGTH 4,600 MM
          </text>
          {/* wheelbase */}
          <line x1={axR} x2={axF} y1={GY + 16} y2={GY + 16} {...dim} strokeDasharray="4 4" />
          <text x={(axF + axR) / 2} y={GY + 12} textAnchor="middle" {...txt} fill="#AAC4B5">
            WHEELBASE 2,800 MM
          </text>
          {/* height */}
          <line x1={xR + 40} x2={xR + 40} y1={GY} y2={GY - roof * S} {...dim} />
          <line x1={xR + 30} x2={xR + 50} y1={GY - roof * S} y2={GY - roof * S} {...dim} />
          <line x1={xR + 30} x2={xR + 50} y1={GY} y2={GY} {...dim} />
          <text x={xR + 56} y={GY - (roof * S) / 2} {...txt} dominantBaseline="middle">
            1,060
          </text>
          <line x1={OX + 0.4 * S} x2={OX + 0.4 * S} y1={GY - roof * S - 6} y2={GY - roof * S - 56} {...dim} strokeOpacity={0.35} />
          <text x={OX + 0.4 * S + 10} y={GY - roof * S - 44} {...txt} fill="#64DCC0">
            CANOPY · ONE-PIECE GLASS
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ---- Material swatches built from CSS only ---- */
const SWATCH: Record<string, React.CSSProperties> = {
  lacquer: {
    background:
      "linear-gradient(115deg, transparent 38%, rgba(234,223,196,0.3) 48%, transparent 58%), radial-gradient(120% 90% at 28% 18%, #1f9174 0%, #0B4A3A 40%, #06241d 100%)",
  },
  titanium: {
    background:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, rgba(0,0,0,0.07) 1px 3px), linear-gradient(135deg, #8f8466 0%, #EADFC4 46%, #a39877 70%, #7d7457 100%)",
  },
  gold: {
    background:
      "repeating-linear-gradient(45deg, rgba(8,42,36,0.18) 0 1px, transparent 1px 14px), linear-gradient(135deg, #7d6530 0%, #D4B46A 38%, #f0dca2 54%, #9b8040 100%)",
  },
  leather: {
    background:
      "radial-gradient(rgba(0,0,0,0.28) 1px, transparent 1.4px) 0 0 / 7px 7px, linear-gradient(160deg, #0f6a50 0%, #0B4A3A 55%, #082A24 100%)",
  },
};

function Materials() {
  const [active, setActive] = useState(0);
  return (
    <div className="grid grid-cols-12 gap-y-10 lg:gap-x-10">
      <ul className="col-span-12 border-t border-vel-gold/20 lg:col-span-6" role="tablist" aria-label="Materials">
        {MATERIALS.map((m, i) => {
          const on = i === active;
          return (
            <li key={m.id} className="border-b border-vel-gold/20">
              <button
                role="tab"
                id={`mat-tab-${m.id}`}
                aria-selected={on}
                aria-controls="mat-panel"
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group flex w-full items-baseline gap-5 py-6 text-left lg:py-7"
              >
                <span className={`label transition-colors ${on ? "!text-vel-mint" : ""}`}>0{i + 1}</span>
                <span className="flex-1">
                  <span
                    className={`block font-display text-xl font-light transition-colors duration-300 lg:text-3xl ${
                      on ? "text-vel-champagne" : "text-vel-sage/60 group-hover:text-vel-sage"
                    }`}
                  >
                    {m.name}
                  </span>
                  <span
                    className={`grid transition-all duration-500 ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <span className="overflow-hidden">
                      <span className="mt-3 block max-w-md text-sm leading-relaxed text-vel-sage">{m.text}</span>
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="col-span-12 lg:col-span-6">
        <div
          id="mat-panel"
          role="tabpanel"
          aria-labelledby={`mat-tab-${MATERIALS[active].id}`}
          className="relative mx-auto aspect-[5/4] w-full max-w-xl overflow-hidden border border-vel-gold/25 lg:ml-auto"
        >
          {MATERIALS.map((m, i) => (
            <div
              key={m.id}
              aria-hidden="true"
              className="absolute inset-0 transition-opacity duration-700"
              style={{ ...SWATCH[m.id], opacity: i === active ? 1 : 0 }}
            >
              {m.id === "leather" && (
                <div className="absolute inset-5 border border-dashed border-vel-gold/70" />
              )}
            </div>
          ))}
          <div className="label absolute bottom-3 left-4 rounded-sm bg-vel-pine/80 px-2 py-1 text-vel-champagne">
            Swatch 0{active + 1} / 04
          </div>
        </div>
      </div>
    </div>
  );
}

export function Design() {
  return (
    <section id="design" className="relative border-t border-vel-gold/15 bg-vel-pine">
      <div className="mx-auto max-w-[1600px] px-5 py-28 lg:px-10 lg:py-40">
        <div className="grid grid-cols-12 gap-y-6 lg:gap-x-10">
          <p className="label label-gold col-span-12 lg:col-span-4">03 — Design</p>
          <Reveal as="h2" className="col-span-12 font-display text-4xl font-light leading-[1.05] lg:col-span-8 lg:text-6xl">
            One line, drawn <br className="hidden lg:block" />
            from nose to tail.
          </Reveal>
          <Reveal delay={150} as="p" className="col-span-12 max-w-md leading-relaxed text-vel-sage lg:col-span-5 lg:col-start-5">
            The shape was set by air first and by taste second. Every crease exists to move air, cool a motor or frame a
            wheel.
          </Reveal>
        </div>

        <div className="mt-16 border-y border-vel-gold/20 py-8 lg:mt-24 lg:py-12">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="label">Fig. 03 — Profile, 1:22</p>
            <p className="label label-gold">Dimensions in mm</p>
          </div>
          <Blueprint />
        </div>

        <div className="mt-24 lg:mt-36">
          <p className="label label-gold mb-10">Materials</p>
          <Materials />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { CarCanvasLazy } from "./CarCanvasLazy";
import { useConfig } from "./ConfigContext";
import { PAINTS, WHEELS } from "@/lib/data";
import type { ViewName } from "@/lib/carStage";

const VIEW_OPTIONS: { id: ViewName; label: string }[] = [
  { id: "hero", label: "3/4" },
  { id: "side", label: "Side" },
  { id: "front", label: "Front" },
  { id: "rear", label: "Rear" },
  { id: "top", label: "Top" },
];

export function Configurator() {
  const { paint, wheels, setPaintId, setWheelId } = useConfig();
  const [view, setView] = useState<ViewName>("hero");

  return (
    <section id="configure" className="relative border-t border-vel-gold/15 bg-vel-pine">
      <div className="mx-auto max-w-[1600px] px-5 pb-20 pt-28 lg:px-10 lg:pb-32 lg:pt-40">
        <div className="mb-12 grid grid-cols-12 gap-y-4 lg:mb-16 lg:gap-x-10">
          <p className="label label-gold col-span-12 lg:col-span-4">05 — Configure</p>
          <h2 className="col-span-12 font-display text-4xl font-light leading-[1.05] lg:col-span-8 lg:text-6xl">
            Make it yours.
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-y-10 border-t border-vel-gold/20 lg:gap-x-0">
          {/* stage */}
          <div className="relative col-span-12 h-[52svh] min-h-[340px] lg:col-span-8 lg:h-[72svh] lg:border-r lg:border-vel-gold/20">
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "radial-gradient(55% 55% at 50% 58%, rgba(11,74,58,0.9) 0%, rgba(8,42,36,0) 72%)" }}
            />
            <CarCanvasLazy
              variant="config"
              paint={paint.hex}
              wheels={wheels.id}
              view={view}
              label={`Interactive 3D configurator. Current paint: ${paint.name}, wheels: ${wheels.name}.`}
            />
            <p className="label pointer-events-none absolute left-4 top-4 lg:left-6 lg:top-6">Live preview</p>
            <p className="label pointer-events-none absolute right-4 top-4 text-right lg:right-6 lg:top-6">
              Drag to rotate
            </p>
          </div>

          {/* controls */}
          <div className="col-span-12 lg:col-span-4 lg:pl-10">
            <fieldset className="border-b border-vel-gold/20 pb-7">
              <legend className="label label-gold mb-5 flex w-full items-baseline justify-between">
                <span>01 · Paint</span>
                <span className="text-vel-champagne">{paint.name}</span>
              </legend>
              <div role="radiogroup" aria-label="Paint" className="flex gap-4">
                {PAINTS.map((p) => {
                  const on = p.id === paint.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={p.name}
                      title={p.name}
                      onClick={() => setPaintId(p.id)}
                      className={`relative h-12 w-12 rounded-full p-[3px] transition-all duration-300 ${
                        on ? "ring-1 ring-vel-gold" : "ring-1 ring-vel-champagne/20 hover:ring-vel-champagne/60"
                      }`}
                    >
                      <span
                        className="block h-full w-full rounded-full"
                        style={{
                          background: `linear-gradient(135deg, rgba(255,255,255,0.28), transparent 45%), ${p.hex}`,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-vel-sage">{paint.note}</p>
            </fieldset>

            <fieldset className="border-b border-vel-gold/20 py-7">
              <legend className="label label-gold mb-5 flex w-full items-baseline justify-between">
                <span>02 · Wheels</span>
                <span className="text-vel-champagne">{wheels.name}</span>
              </legend>
              <div role="radiogroup" aria-label="Wheel finish" className="grid grid-cols-3 gap-px bg-vel-gold/20">
                {WHEELS.map((w) => {
                  const on = w.id === wheels.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setWheelId(w.id)}
                      className={`flex flex-col items-center gap-2 py-4 transition-colors duration-300 ${
                        on ? "bg-vel-malachite text-vel-champagne" : "bg-vel-pine text-vel-sage hover:bg-vel-malachite/50"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full border ${on ? "border-vel-mint" : "border-vel-champagne/30"}`}
                        style={{ background: w.hex }}
                      />
                      <span className="label !text-inherit">{w.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="border-b border-vel-gold/20 py-7">
              <legend className="label label-gold mb-5">03 · View</legend>
              <div role="radiogroup" aria-label="Camera view" className="flex flex-wrap gap-2">
                {VIEW_OPTIONS.map((v) => {
                  const on = v.id === view;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setView(v.id)}
                      className={`label min-h-10 border px-4 transition-colors duration-300 ${
                        on
                          ? "border-vel-mint !text-vel-mint"
                          : "border-vel-champagne/25 hover:border-vel-champagne/60 hover:!text-vel-champagne"
                      }`}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="pt-7">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-vel-sage">Paint</dt>
                  <dd>{paint.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-vel-sage">Wheels</dt>
                  <dd>{wheels.name}</dd>
                </div>
              </dl>
              <p className="label mt-6">From</p>
              <p className="font-display text-4xl font-light">
                €1,480,000
              </p>
              <a href="#reserve" className="btn btn-primary mt-6 w-full">
                Reserve this configuration <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

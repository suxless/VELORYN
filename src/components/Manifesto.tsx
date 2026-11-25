"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./hooks";

const TEXT =
  "ORIEL begins with one idea: speed is most convincing when it is calm. Four motors. One continuous surface. Nothing added that does not earn its place.";

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const words = TEXT.split(" ");
  const [lit, setLit] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setLit(words.length);
      return;
    }
    let raf = 0;
    const calc = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height * 0.8 + vh * 0.1)));
      setLit(Math.round(p * words.length));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [words.length]);

  return (
    <section id="model" ref={ref} className="relative border-t border-vel-gold/15 bg-vel-pine">
      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-y-10 px-5 py-28 lg:px-10 lg:py-44">
        <div className="col-span-12 lg:col-span-2">
          <p className="label label-gold">01 — Philosophy</p>
        </div>
        <div className="col-span-12 lg:col-span-9 lg:col-start-4">
          <p className="font-display text-[1.65rem] font-light leading-[1.25] sm:text-4xl lg:text-[3.4rem] lg:leading-[1.18]">
            {words.map((w, i) => (
              <span
                key={i}
                className="transition-colors duration-500"
                style={{ color: i < lit ? "#EADFC4" : "rgba(170,196,181,0.28)" }}
              >
                {w}{" "}
              </span>
            ))}
          </p>
          <dl className="mt-16 grid grid-cols-1 gap-px border-y border-vel-gold/20 bg-vel-gold/20 sm:grid-cols-3">
            {[
              ["Units", "99"],
              ["Seats", "2"],
              ["Hand-finished", "1,100 hrs"],
            ].map(([k, v]) => (
              <div key={k} className="bg-vel-pine py-6 sm:px-6 sm:first:pl-0">
                <dt className="label">{k}</dt>
                <dd className="mt-2 font-display text-3xl font-light">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

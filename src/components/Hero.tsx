import { HeroCar } from "./HeroCar";
import { HERO_STATS } from "@/lib/data";

function Corner({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute h-3 w-3 border-vel-gold/60 ${className}`} />;
}

export function Hero() {
  return (
    <section id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      {/* backdrop: depth + modular grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 55% at 68% 58%, rgba(11,74,58,0.95) 0%, rgba(6,54,43,0) 70%), linear-gradient(180deg, #06362B 0%, #082A24 100%)",
        }}
      />
      <div aria-hidden="true" className="grid-lines absolute inset-0 -z-10 mx-auto max-w-[1600px]" />

      {/* giant model name, sits behind the car */}
      <h1 className="relative z-0 px-5 pt-28 lg:absolute lg:left-10 lg:top-[15%] lg:p-0">
        <span className="intro-fade label label-gold mb-3 block lg:mb-5" style={{ "--d": "200ms" } as React.CSSProperties}>
          Veloryn · Model 01
        </span>
        <span
          className="intro-rise block font-display font-light uppercase leading-[0.82] tracking-[-0.02em] text-vel-champagne"
          style={{ fontSize: "clamp(4.5rem, 13.2vw, 13rem)", "--d": "350ms" } as React.CSSProperties}
        >
          Oriel
        </span>
      </h1>

      {/* 3D stage */}
      <div
        className="intro-fade relative z-10 -mt-4 h-[50svh] min-h-[320px] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-auto lg:w-[74%]"
        style={{ "--d": "100ms" } as React.CSSProperties}
      >
        <HeroCar />
        <div className="label pointer-events-none absolute right-5 top-4 hidden text-right lg:right-10 lg:top-24 lg:block">
          Fig. 01 — Front three-quarter
          <br />
          <span className="label-gold">Drag to rotate</span>
        </div>
        <div className="label pointer-events-none absolute bottom-3 right-5 lg:bottom-8 lg:right-10">
          Cd 0.21 · 44/56
        </div>
      </div>

      {/* slogan + calls to action */}
      <div className="relative z-20 px-5 pt-6 lg:absolute lg:bottom-[19%] lg:left-10 lg:max-w-sm lg:p-0">
        <div className="relative max-w-sm">
          <p
            className="intro-rise font-display text-xl font-light leading-snug text-vel-champagne lg:text-2xl"
            style={{ "--d": "700ms" } as React.CSSProperties}
          >
            Silence at speed.
          </p>
          <p
            className="intro-rise mt-3 text-sm leading-relaxed text-vel-sage lg:text-base"
            style={{ "--d": "850ms" } as React.CSSProperties}
          >
            The first electric hypercar from VELORYN. Four motors, one continuous surface, limited to 99 units.
          </p>
          <div className="intro-rise mt-7 flex flex-wrap gap-3" style={{ "--d": "1000ms" } as React.CSSProperties}>
            <a href="#configure" className="btn btn-primary">
              Configure <span className="arrow">→</span>
            </a>
            <a href="#model" className="btn btn-ghost">
              Explore
            </a>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div className="label pointer-events-none absolute bottom-[7.5rem] left-10 z-20 hidden items-center gap-3 lg:flex" aria-hidden="true">
        <span className="relative block h-10 w-px overflow-hidden bg-vel-gold/20">
          <span className="absolute inset-0 bg-vel-gold" style={{ animation: "scrollcue 2.4s ease-in-out infinite" }} />
        </span>
        Scroll
      </div>

      {/* spec strip */}
      <div className="relative z-20 mt-8 lg:mt-auto">
        <dl className="mx-auto grid max-w-[1600px] grid-cols-2 gap-px border-t border-vel-gold/20 bg-vel-gold/20 lg:grid-cols-4">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="bg-vel-emerald/95 px-5 py-5 lg:px-10 lg:py-7">
              <dt className="label">{s.label}</dt>
              <dd className="mt-2 font-display text-2xl font-light lg:text-4xl">
                {s.value}
                <span className="ml-1.5 font-mono text-xs tracking-widest text-vel-gold">{s.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <Corner className="left-5 top-20 border-l border-t lg:left-10" />
      <Corner className="right-5 top-20 border-r border-t lg:right-10" />
    </section>
  );
}

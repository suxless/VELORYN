"use client";

import { useState, type FormEvent } from "react";
import { Reveal } from "./Reveal";
import { useConfig } from "./ConfigContext";
import { COUNTRIES } from "@/lib/data";

type Errors = Partial<Record<"name" | "email" | "country" | "consent", string>>;

export function Reserve() {
  const { paint, wheels } = useConfig();
  const [errors, setErrors] = useState<Errors>({});
  const [ref, setRef] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const country = String(f.get("country") ?? "");
    const consent = f.get("consent") === "on";

    const next: Errors = {};
    if (name.length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = "Please enter a valid email address.";
    if (!country) next.country = "Please choose your country.";
    if (!consent) next.consent = "Please confirm to continue.";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = (["name", "email", "country", "consent"] as const).find((k) => next[k]);
      if (first) (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    // Demo only: nothing is sent anywhere.
    setRef(`VLR-${Math.floor(1000 + Math.random() * 9000)}`);
  }

  return (
    <section id="reserve" className="relative border-t border-vel-gold/15 bg-vel-emerald">
      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-y-14 px-5 py-28 lg:gap-x-10 lg:px-10 lg:py-40">
        <div className="col-span-12 lg:col-span-5">
          <p className="label label-gold">06 — Reserve</p>
          <Reveal as="h2" className="mt-6 font-display text-4xl font-light leading-[1.05] lg:text-6xl">
            Ninety-nine <br />
            will exist.
          </Reveal>
          <Reveal delay={150} as="p" className="mt-6 max-w-sm leading-relaxed text-vel-sage">
            Allocations are offered one per owner. Register your interest and a VELORYN representative will arrange a
            private viewing.
          </Reveal>

          <dl className="mt-12 border-t border-vel-gold/20 text-sm">
            {[
              ["Model", "ORIEL"],
              ["Paint", paint.name],
              ["Wheels", wheels.name],
              ["From", "€1,480,000"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-vel-gold/20 py-4">
                <dt className="label">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          {ref ? (
            <div role="status" className="border border-vel-mint/40 bg-vel-pine/70 p-8 lg:p-12">
              <p className="label !text-vel-mint">Request received</p>
              <p className="mt-5 font-display text-3xl font-light leading-tight lg:text-4xl">
                Your place in the queue is held.
              </p>
              <p className="mt-6 leading-relaxed text-vel-sage">
                Reference <span className="font-mono tracking-widest text-vel-champagne">{ref}</span>. This is a design
                demonstration, so nothing was sent or stored.
              </p>
              <button type="button" onClick={() => setRef(null)} className="btn btn-ghost mt-8">
                Start again
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-8">
              <div>
                <label htmlFor="name" className="label block">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  className="field"
                  placeholder="Alexandra Moreau"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "err-name" : undefined}
                />
                {errors.name && (
                  <p id="err-name" role="alert" className="mt-2 text-sm text-[#e8a17a]">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="label block">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="field"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "err-email" : undefined}
                />
                {errors.email && (
                  <p id="err-email" role="alert" className="mt-2 text-sm text-[#e8a17a]">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="country" className="label block">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  defaultValue=""
                  autoComplete="country-name"
                  className="field"
                  aria-invalid={!!errors.country}
                  aria-describedby={errors.country ? "err-country" : undefined}
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p id="err-country" role="alert" className="mt-2 text-sm text-[#e8a17a]">
                    {errors.country}
                  </p>
                )}
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-vel-sage">
                  <input
                    type="checkbox"
                    name="consent"
                    className="mt-1 h-4 w-4 shrink-0 accent-[#64DCC0]"
                    aria-invalid={!!errors.consent}
                    aria-describedby={errors.consent ? "err-consent" : undefined}
                  />
                  I would like to be contacted about ORIEL allocations.
                </label>
                {errors.consent && (
                  <p id="err-consent" role="alert" className="mt-2 text-sm text-[#e8a17a]">
                    {errors.consent}
                  </p>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-full sm:w-auto">
                Request allocation <span className="arrow">→</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { NAV } from "@/lib/data";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.href.slice(1))).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled || open ? "border-b border-vel-gold/15 bg-vel-pine/90 backdrop-blur-sm" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-[1600px] items-center justify-between px-5 lg:px-10">
          <a href="#top" aria-label="VELORYN — back to top" onClick={() => setOpen(false)}>
            <Logo />
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                aria-current={active === n.href.slice(1) ? "true" : undefined}
                className={`label relative py-2 transition-colors hover:text-vel-champagne ${
                  active === n.href.slice(1) ? "!text-vel-champagne" : ""
                }`}
              >
                {n.label}
                <span
                  className={`absolute inset-x-0 -bottom-px h-px origin-left bg-vel-mint transition-transform duration-500 ${
                    active === n.href.slice(1) ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a href="#reserve" className="btn btn-ghost !min-h-10 !px-5 max-sm:hidden">
              Reserve
            </a>
            <button
              type="button"
              className="flex h-10 w-10 flex-col items-center justify-center gap-[6px] lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className={`h-px w-6 bg-vel-champagne transition-transform duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`h-px w-6 bg-vel-champagne transition-transform duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-vel-pine px-5 pb-10 pt-28 transition-opacity duration-500 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {NAV.map((n, i) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="flex items-baseline gap-5 border-b border-vel-gold/15 py-5 font-display text-3xl font-light"
            >
              <span className="label label-gold">0{i + 1}</span>
              {n.label}
            </a>
          ))}
        </nav>
        <a href="#reserve" onClick={() => setOpen(false)} className="btn btn-primary w-full">
          Reserve your allocation
        </a>
      </div>
    </>
  );
}

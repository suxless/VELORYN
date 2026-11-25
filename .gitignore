import { Logo } from "./Logo";
import { NAV } from "@/lib/data";

export function Footer() {
  return (
    <footer className="border-t border-vel-gold/15 bg-vel-pine">
      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-y-10 px-5 py-16 lg:gap-x-10 lg:px-10 lg:py-24">
        <div className="col-span-12 lg:col-span-5">
          <Logo />
          <p className="mt-6 max-w-xs font-display text-xl font-light leading-snug">Silence at speed.</p>
        </div>

        <nav aria-label="Footer" className="col-span-6 lg:col-span-3 lg:col-start-7">
          <p className="label label-gold mb-4">Explore</p>
          <ul className="space-y-3 text-sm text-vel-sage">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition-colors hover:text-vel-champagne">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#reserve" className="transition-colors hover:text-vel-champagne">
                Reserve
              </a>
            </li>
          </ul>
        </nav>

        <div className="col-span-6 lg:col-span-3">
          <p className="label label-gold mb-4">Atelier</p>
          <p className="text-sm leading-relaxed text-vel-sage">
            Private viewings by appointment.
            <br />
            Geneva · Dubai · Tokyo
          </p>
        </div>
      </div>

      <div className="border-t border-vel-gold/15">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-5 py-6 lg:flex-row lg:justify-between lg:px-10">
          <p className="label">© 2026 VELORYN. A fictional brand created for design demonstration.</p>
          <p className="label">VLR—ORIEL / Rev. 01</p>
        </div>
      </div>
    </footer>
  );
}

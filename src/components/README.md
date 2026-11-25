# VELORYN — ORIEL

A demonstration website for **VELORYN**, a fictional electric hypercar brand, and its first model, **ORIEL**.
Built as a showcase of interactive 3D, art direction and responsive front-end craft. The brand, texts and numbers are invented.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · three.js

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start
```

Other scripts:

```bash
npm run typecheck        # tsc --noEmit
npm run check:geometry   # sanity checks for the procedural car body (no three.js needed)
```

Node 20+ is recommended. Fonts (Unbounded, Manrope, JetBrains Mono) are fetched by `next/font/google` at build time, so the first build needs internet access.

## What is in it

| Section | Idea |
| --- | --- |
| Hero | Giant `ORIEL` type behind a live 3D car. Drag to rotate, subtle pointer parallax, cinematic intro. |
| Philosophy | Statement that lights up word by word as you scroll. |
| Performance | Hairline-ruled spec rows with count-up numbers and a self-drawing power curve. |
| Design | Blueprint drawn from the same curves as the 3D model, plus an interactive materials list. |
| Technology | Plan-view chassis schematic with animated power flow. |
| Configure | Second 3D scene: paint, wheel finish and camera views update in real time. |
| Reserve | Accessible validated form. Demo only: nothing is sent. |

## Design system

Colours live in `src/app/globals.css` (`@theme`): emerald `#06362B` dominates, malachite `#0B4A3A` for surfaces, pine `#082A24` for deeper areas, gold `#D4B46A` as metal accent, champagne `#EADFC4` for text, sage `#AAC4B5` for secondary text, mint `#64DCC0` for interaction.

## How the 3D works

There is no external model file. The car is generated in code:

- `src/lib/carGeometry.ts` — pure math. The body and glass canopy are lofted from superellipse cross-sections whose size follows hand-tuned spline profiles. The blueprint, loading silhouette and top-view schematic are drawn from the same profiles, so every drawing matches the 3D car.
- `src/lib/carStage.ts` — the three.js scene: custom emerald studio environment for reflections, clear-coated paint, wheels, light signature, orbit camera with inertia, resize/visibility handling and full disposal.
- If WebGL is unavailable, a line-drawn silhouette is shown instead. `prefers-reduced-motion` disables the camera sway and entrance animation.

To change the car, edit the knot arrays at the top of `carGeometry.ts` (`WIDTH`, `TOP`, `BOTTOM`, `CAN_TOP`, `CAN_W`) and run `npm run check:geometry`.

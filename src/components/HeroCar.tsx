"use client";

import { CarCanvasLazy } from "./CarCanvasLazy";
import { useConfig } from "./ConfigContext";

/** Hero car mirrors whatever paint and wheels were chosen in the configurator. */
export function HeroCar() {
  const { paint, wheels } = useConfig();
  return (
    <CarCanvasLazy
      variant="hero"
      paint={paint.hex}
      wheels={wheels.id}
      view="hero"
      label="Interactive 3D model of the VELORYN ORIEL. Drag to rotate."
    />
  );
}

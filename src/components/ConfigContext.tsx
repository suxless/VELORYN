"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { WheelFinish } from "@/lib/carStage";
import { PAINTS, WHEELS, type Paint, type WheelOption } from "@/lib/data";

interface ConfigState {
  paint: Paint;
  wheels: WheelOption;
  setPaintId: (id: string) => void;
  setWheelId: (id: WheelFinish) => void;
}

const Ctx = createContext<ConfigState | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [paintId, setPaintId] = useState(PAINTS[0].id);
  const [wheelId, setWheelId] = useState<WheelFinish>(WHEELS[0].id);

  const value = useMemo<ConfigState>(
    () => ({
      paint: PAINTS.find((p) => p.id === paintId) ?? PAINTS[0],
      wheels: WHEELS.find((w) => w.id === wheelId) ?? WHEELS[0],
      setPaintId,
      setWheelId,
    }),
    [paintId, wheelId]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useConfig(): ConfigState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useConfig must be used inside ConfigProvider");
  return v;
}

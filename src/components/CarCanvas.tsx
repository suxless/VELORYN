"use client";

import { useEffect, useRef, useState } from "react";
import { CarStage, type ViewName, type WheelFinish } from "@/lib/carStage";
import { CarSilhouette } from "./CarSilhouette";

interface Props {
  variant: "hero" | "config";
  paint: string;
  wheels: WheelFinish;
  view?: ViewName;
  label: string;
}

export default function CarCanvas({ variant, paint, wheels, view = "hero", label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<CarStage | null>(null);
  const initial = useRef({ paint, wheels, view });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let stage: CarStage;
    try {
      stage = new CarStage(canvas, { variant, ...initial.current });
    } catch {
      setFailed(true);
      return;
    }
    stage.onReady = () => setReady(true);
    stage.start();
    stageRef.current = stage;
    return () => {
      stage.dispose();
      stageRef.current = null;
    };
  }, [variant]);

  useEffect(() => {
    stageRef.current?.setPaint(paint);
  }, [paint]);
  useEffect(() => {
    stageRef.current?.setWheels(wheels);
  }, [wheels]);
  useEffect(() => {
    stageRef.current?.setView(view);
  }, [view]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center px-6">
        <CarSilhouette className="w-full max-w-3xl" />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className="block h-full w-full transition-opacity duration-[1400ms]"
      style={{ opacity: ready ? 1 : 0 }}
    />
  );
}

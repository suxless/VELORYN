"use client";

import dynamic from "next/dynamic";
import { CarSilhouette } from "./CarSilhouette";

/** three.js is loaded on the client only, after the page shell has painted. */
export const CarCanvasLazy = dynamic(() => import("./CarCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center px-6" aria-hidden="true">
      <CarSilhouette className="w-full max-w-3xl animate-pulse opacity-60" />
    </div>
  ),
});

"use client";

import type { ElementType, ReactNode } from "react";
import { useInView } from "./hooks";

interface Props {
  children: ReactNode;
  delay?: number;
  as?: "div" | "li" | "p" | "span" | "h2" | "h3";
  className?: string;
}

export function Reveal({ children, delay = 0, as = "div", className = "" }: Props) {
  const [ref, inView] = useInView<HTMLElement>();
  const Comp = as as ElementType;
  return (
    <Comp
      ref={ref}
      data-in={inView}
      className={`reveal ${className}`}
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Comp>
  );
}

"use client";

import type { CSSProperties } from "react";

type Props = {
  colors: string[];
};

/** Fundo vivo derivado da paleta medida — sem texto. */
export function AnalysisAtmosphere({ colors }: Props) {
  const [a0, a1, a2] = [
    colors[0] || "#c4a484",
    colors[1] || "#d9e2ec",
    colors[2] || "#e8c4a8",
  ];

  return (
    <div
      className="analysis-atmosphere"
      aria-hidden
      style={
        {
          "--a0": a0,
          "--a1": a1,
          "--a2": a2,
        } as CSSProperties
      }
    />
  );
}

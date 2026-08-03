import type { FaceBox, FaceRoi } from "./types";

/** Deriva ROIs estáveis a partir do bbox do rosto (coords normalizadas 0–1). */
export function roisFromFaceBox(box: FaceBox): FaceRoi[] {
  const { x, y, width: w, height: h } = box;
  return [
    {
      kind: "forehead",
      x: x + w * 0.25,
      y: y + h * 0.08,
      width: w * 0.5,
      height: h * 0.18,
    },
    {
      kind: "leftCheek",
      x: x + w * 0.08,
      y: y + h * 0.38,
      width: w * 0.28,
      height: h * 0.22,
    },
    {
      kind: "rightCheek",
      x: x + w * 0.64,
      y: y + h * 0.38,
      width: w * 0.28,
      height: h * 0.22,
    },
    {
      kind: "jaw",
      x: x + w * 0.28,
      y: y + h * 0.62,
      width: w * 0.44,
      height: h * 0.2,
    },
  ].map((r) => ({
    ...r,
    x: clamp01(r.x),
    y: clamp01(r.y),
    width: Math.min(r.width, 1 - clamp01(r.x)),
    height: Math.min(r.height, 1 - clamp01(r.y)),
  }));
}

/** União das ROIs (ou o próprio bbox) para crop de análise. */
export function analysisCropFromFace(box: FaceBox): FaceBox {
  // Margem leve para incluir testa/mandíbula sem fundo excessivo
  const padX = box.width * 0.08;
  const padY = box.height * 0.1;
  const x = clamp01(box.x - padX);
  const y = clamp01(box.y - padY);
  const right = Math.min(1, box.x + box.width + padX);
  const bottom = Math.min(1, box.y + box.height + padY);
  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
    score: box.score,
  };
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function boxToPixels(
  box: Pick<FaceBox, "x" | "y" | "width" | "height">,
  width: number,
  height: number,
) {
  const left = Math.floor(box.x * width);
  const top = Math.floor(box.y * height);
  const w = Math.max(1, Math.floor(box.width * width));
  const h = Math.max(1, Math.floor(box.height * height));
  return {
    left: Math.min(left, Math.max(0, width - 1)),
    top: Math.min(top, Math.max(0, height - 1)),
    width: Math.min(w, width - left),
    height: Math.min(h, height - top),
  };
}

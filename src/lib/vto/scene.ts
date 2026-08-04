import type { VtoFaceBox } from "./types";

export type SimulationScene = "garment_visible" | "face_closeup";

/**
 * Infere se há tronco/roupa visível ou se a selfie é só rosto (pouco espaço abaixo do queixo).
 * Usa o faceBox normalizado (0–1) da análise.
 */
export function detectSimulationScene(faceBox?: VtoFaceBox): SimulationScene {
  if (!faceBox) {
    // Sem bbox: assume que pode haver roupa e tenta recolor; overlay cobre o resto
    return "garment_visible";
  }
  const area = faceBox.width * faceBox.height;
  const faceBottom = faceBox.y + faceBox.height;
  const roomBelow = 1 - faceBottom;

  if (area >= 0.28 || faceBox.height >= 0.52 || roomBelow < 0.18) {
    return "face_closeup";
  }
  return "garment_visible";
}

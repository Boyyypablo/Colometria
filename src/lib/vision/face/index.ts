import { BlazeFaceDetector, OnnxYunetDetector } from "./providers/blazeface";
import { HeuristicFaceDetector } from "./providers/heuristic";
import type { FaceDetectionResult, FaceDetector } from "./types";

export type FaceDetectorId = "heuristic" | "blazeface" | "onnx-yunet";

const heuristic = new HeuristicFaceDetector();

export function resolveFaceDetectorId(
  raw = process.env.FACE_DETECTOR,
): FaceDetectorId {
  const id = (raw || "heuristic").toLowerCase();
  if (id === "blazeface" || id === "onnx-yunet" || id === "heuristic") return id;
  return "heuristic";
}

export function createFaceDetector(id?: FaceDetectorId): FaceDetector {
  switch (id ?? resolveFaceDetectorId()) {
    case "blazeface":
      return new BlazeFaceDetector();
    case "onnx-yunet":
      return new OnnxYunetDetector();
    default:
      return heuristic;
  }
}

/**
 * Detecta rosto com o provider configurado.
 * Qualquer falha → heuristic (plano: manter e trocar sem quebrar análise).
 */
export async function detectFaceWithFallback(
  buffer: Buffer,
  width: number,
  height: number,
  preferred?: FaceDetectorId,
): Promise<FaceDetectionResult> {
  const id = preferred ?? resolveFaceDetectorId();
  const primary = createFaceDetector(id);

  try {
    const result = await primary.detect(buffer, width, height);
    if (!result.primary) {
      throw new Error("Detector não retornou face primária");
    }
    return result;
  } catch (err) {
    if (id === "heuristic") {
      throw err;
    }
    const fallback = await heuristic.detect(buffer, width, height);
    const msg =
      err instanceof Error ? err.message : "Falha no detector configurado";
    return {
      ...fallback,
      provider: `heuristic(fallback-from:${id})`,
      usedFallback: true,
      warnings: [
        ...fallback.warnings,
        `Detector "${id}" indisponível (${msg}). Usando heuristic.`,
      ],
    };
  }
}

export type { FaceBox, FaceDetectionResult, FaceDetector, FaceRoi } from "./types";
export { roisFromFaceBox, analysisCropFromFace, boxToPixels } from "./rois";

import type { FaceDetectionResult, FaceDetector } from "../types";
import { roisFromFaceBox } from "../rois";

/**
 * Stub reservado — ativar com FACE_DETECTOR=blazeface após instalar:
 *   npm i @tensorflow/tfjs @tensorflow-models/blazeface
 * Até lá, o factory faz fallback para heuristic.
 */
export class BlazeFaceDetector implements FaceDetector {
  readonly id = "blazeface";

  async detect(
    _buffer: Buffer,
    _width: number,
    _height: number,
  ): Promise<FaceDetectionResult> {
    throw new Error(
      "Provider blazeface ainda não empacotado. Instale @tensorflow/tfjs e @tensorflow-models/blazeface, ou use FACE_DETECTOR=heuristic.",
    );
  }
}

/** Stub para swap futuro (YuNet ONNX). */
export class OnnxYunetDetector implements FaceDetector {
  readonly id = "onnx-yunet";

  async detect(
    _buffer: Buffer,
    _width: number,
    _height: number,
  ): Promise<FaceDetectionResult> {
    throw new Error(
      "Provider onnx-yunet reservado. Defina FACE_DETECTOR=heuristic ou implemente o adapter.",
    );
  }
}

/** Helper para testes unitários de ROI sem I/O. */
export function emptyDetection(
  provider: string,
  warnings: string[] = [],
): FaceDetectionResult {
  const primary = { x: 0.25, y: 0.12, width: 0.5, height: 0.55, score: 0 };
  return {
    provider,
    faces: [],
    primary,
    rois: roisFromFaceBox(primary),
    warnings,
    usedFallback: true,
  };
}

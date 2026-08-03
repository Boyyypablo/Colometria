export type FaceBox = {
  /** Normalizado 0–1 relativo à imagem original. */
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
};

export type FaceRoiKind = "leftCheek" | "rightCheek" | "forehead" | "jaw";

export type FaceRoi = {
  kind: FaceRoiKind;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FaceDetectionResult = {
  provider: string;
  faces: FaceBox[];
  /** Maior face, ou null se nenhuma. */
  primary: FaceBox | null;
  rois: FaceRoi[];
  warnings: string[];
  usedFallback: boolean;
};

export interface FaceDetector {
  readonly id: string;
  detect(buffer: Buffer, width: number, height: number): Promise<FaceDetectionResult>;
}

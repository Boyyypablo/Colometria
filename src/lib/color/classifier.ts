import sharp from "sharp";
import { chromaFromLab, median, rgbToLab } from "./cielab";
import { shouldNeedsReview } from "./confidence";
import { createColorPredictor } from "./predictor";
import type {
  ClassificationResult,
  ColorFeatures,
  FaceRoiLab,
  LabColor,
  PhotoQuality,
} from "./types";
import {
  boxToPixels,
  detectFaceWithFallback,
  type FaceRoi,
} from "@/lib/vision/face";
import { isSkinPixel } from "@/lib/vision/face/providers/heuristic";

async function sampleRoiLabs(
  buffer: Buffer,
  width: number,
  height: number,
  rois: FaceRoi[],
): Promise<FaceRoiLab[]> {
  const results: FaceRoiLab[] = [];

  for (const roi of rois) {
    const px = boxToPixels(roi, width, height);
    if (px.width < 4 || px.height < 4) continue;

    try {
      const { data, info } = await sharp(buffer)
        .rotate()
        .ensureAlpha()
        .extract(px)
        .resize({ width: 96, height: 96, fit: "inside" })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const labs: LabColor[] = [];
      const channels = info.channels;
      for (let i = 0; i < data.length; i += channels) {
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        if (!isSkinPixel(r, g, b)) continue;
        labs.push(rgbToLab(r, g, b));
      }

      if (labs.length < 8) continue;
      results.push({
        kind: roi.kind,
        lab: {
          L: median(labs.map((l) => l.L)),
          a: median(labs.map((l) => l.a)),
          b: median(labs.map((l) => l.b)),
        },
        sampleCount: labs.length,
      });
    } catch {
      // ROI fora dos limites / extract falhou — ignora
    }
  }

  return results;
}

function undertoneLabFromRois(
  roiLabs: FaceRoiLab[],
  fallback: LabColor,
): LabColor {
  const cheeks = roiLabs.filter(
    (r) => r.kind === "leftCheek" || r.kind === "rightCheek",
  );
  if (cheeks.length === 0) return fallback;
  return {
    L: median(cheeks.map((c) => c.lab.L)),
    a: median(cheeks.map((c) => c.lab.a)),
    b: median(cheeks.map((c) => c.lab.b)),
  };
}

export async function analyzeImageBuffer(
  buffer: Buffer,
): Promise<ClassificationResult> {
  const image = sharp(buffer).rotate().ensureAlpha();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  const warnings: string[] = [];
  if (width < 400 || height < 400) {
    warnings.push("Resolução baixa — prefira fotos com pelo menos 800px.");
  }

  const face = await detectFaceWithFallback(buffer, width, height);
  warnings.push(...face.warnings);

  const cropBox = face.primary ?? {
    x: 0.25,
    y: 0.12,
    width: 0.5,
    height: 0.55,
    score: 0,
  };
  const cropPx = boxToPixels(cropBox, width, height);

  const { data, info } = await sharp(buffer)
    .rotate()
    .ensureAlpha()
    .extract(cropPx)
    .resize({ width: 320, height: 320, fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const labs: LabColor[] = [];
  let skinCount = 0;
  const totalPixels = info.width * info.height;
  let luminanceSum = 0;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    luminanceSum += 0.299 * r + 0.587 * g + 0.114 * b;
    if (!isSkinPixel(r, g, b)) continue;
    skinCount += 1;
    labs.push(rgbToLab(r, g, b));
  }

  const avgLuma = luminanceSum / Math.max(1, totalPixels);
  const lightingWarning = avgLuma < 60 || avgLuma > 210;
  if (lightingWarning) {
    warnings.push(
      "Iluminação possivelmente irregular — use luz natural frontal neutra.",
    );
  }

  const faceDetected = Boolean(face.faces.length > 0 && !face.usedFallback);
  const faceLikeDetected = faceDetected || skinCount >= 80;
  if (!faceLikeDetected) {
    warnings.push(
      "Poucos pixels de pele / rosto não localizado — centralize o rosto sem maquiagem pesada.",
    );
  }

  if (labs.length < 40) {
    for (let i = 0; i < data.length; i += channels * 8) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      labs.push(rgbToLab(r, g, b));
    }
  }

  const Lvals = labs.map((l) => l.L);
  const aVals = labs.map((l) => l.a);
  const bVals = labs.map((l) => l.b);
  const lab: LabColor = {
    L: median(Lvals),
    a: median(aVals),
    b: median(bVals),
  };

  const roiLabs = await sampleRoiLabs(buffer, width, height, face.rois);
  const labUndertone = undertoneLabFromRois(roiLabs, lab);

  const sortedL = [...Lvals].sort((a, b) => a - b);
  const p10 = sortedL[Math.floor(sortedL.length * 0.1)] ?? lab.L;
  const p90 = sortedL[Math.floor(sortedL.length * 0.9)] ?? lab.L;
  const contrastScore = p90 - p10;

  const features: ColorFeatures = {
    featureSchemaVersion: 1,
    lab,
    labUndertone,
    temperatureScore: Number(
      (labUndertone.b * 0.7 + labUndertone.a * 0.3).toFixed(2),
    ),
    valueScore: Number(lab.L.toFixed(2)),
    chromaScore: Number(chromaFromLab(labUndertone).toFixed(2)),
    contrastScore: Number(contrastScore.toFixed(2)),
    skinPixelRatio: Number((skinCount / Math.max(1, totalPixels)).toFixed(4)),
    sampleCount: labs.length,
    detectorProvider: face.provider,
    faceBox: face.primary,
    roiLabs,
  };

  const predictor = createColorPredictor();
  const { seasonId, undertoneLabel, confidence } = predictor.predict(features);
  const needsReview = shouldNeedsReview({
    confidence,
    temperatureScore: features.temperatureScore,
    faceLikeDetected,
    lightingWarning,
    usedFaceFallback: face.usedFallback,
  });

  const photoQuality: PhotoQuality = {
    width,
    height,
    faceLikeDetected,
    faceDetected,
    detectorProvider: face.provider,
    usedFaceFallback: face.usedFallback,
    lightingWarning,
    warnings: [...new Set(warnings)],
  };

  return {
    seasonId,
    confidence,
    undertoneLabel,
    features,
    photoQuality,
    needsReview,
    predictorId: predictor.id,
  };
}

/** Classifica a partir de um Lab já conhecido (testes / fixtures). */
export function classifyFromLab(
  lab: LabColor,
  extras?: Partial<ColorFeatures> & { width?: number; height?: number },
): ClassificationResult {
  const features: ColorFeatures = {
    featureSchemaVersion: 1,
    lab,
    labUndertone: lab,
    temperatureScore: Number((lab.b * 0.7 + lab.a * 0.3).toFixed(2)),
    valueScore: Number(lab.L.toFixed(2)),
    chromaScore: Number(chromaFromLab(lab).toFixed(2)),
    contrastScore: extras?.contrastScore ?? 20,
    skinPixelRatio: extras?.skinPixelRatio ?? 0.12,
    sampleCount: extras?.sampleCount ?? 1000,
    detectorProvider: extras?.detectorProvider ?? "test",
    faceBox: extras?.faceBox ?? {
      x: 0.25,
      y: 0.12,
      width: 0.5,
      height: 0.55,
      score: 1,
    },
    roiLabs: extras?.roiLabs ?? [],
  };
  const predictor = createColorPredictor();
  const { seasonId, undertoneLabel, confidence } = predictor.predict(features);
  const photoQuality: PhotoQuality = {
    width: extras?.width ?? 800,
    height: extras?.height ?? 800,
    faceLikeDetected: true,
    faceDetected: true,
    detectorProvider: features.detectorProvider,
    usedFaceFallback: false,
    lightingWarning: false,
    warnings: [],
  };
  return {
    seasonId,
    confidence,
    undertoneLabel,
    features,
    photoQuality,
    needsReview: shouldNeedsReview({
      confidence,
      temperatureScore: features.temperatureScore,
      faceLikeDetected: true,
      lightingWarning: false,
      usedFaceFallback: false,
    }),
    predictorId: predictor.id,
  };
}

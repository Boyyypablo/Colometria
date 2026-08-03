import sharp from "sharp";
import { chromaFromLab, median, rgbToLab } from "./cielab";
import type {
  ClassificationResult,
  ColorFeatures,
  LabColor,
  PhotoQuality,
} from "./types";

/** Heurística YCbCr para pixels de pele. */
function isSkinPixel(r: number, g: number, b: number): boolean {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return (
    y > 40 &&
    y < 240 &&
    cb >= 77 &&
    cb <= 127 &&
    cr >= 133 &&
    cr <= 173 &&
    r > 60 &&
    g > 30 &&
    b > 15 &&
    r > g &&
    r > b
  );
}

function classifySeason(features: ColorFeatures): {
  seasonId: string;
  undertoneLabel: string;
  confidence: number;
} {
  const warm = features.temperatureScore >= 0;
  const undertoneLabel = warm
    ? features.temperatureScore > 8
      ? "quente (dourado)"
      : "quente suave"
    : features.temperatureScore < -8
      ? "frio (rosado/azulado)"
      : "frio suave";

  const value: "light" | "medium" | "deep" =
    features.valueScore >= 68
      ? "light"
      : features.valueScore <= 48
        ? "deep"
        : "medium";

  const chroma: "bright" | "soft" | "muted" =
    features.chromaScore >= 22
      ? "bright"
      : features.chromaScore <= 12
        ? "muted"
        : "soft";

  let seasonId: string;
  if (warm) {
    if (value === "light" && chroma === "bright") seasonId = "bright_spring";
    else if (value === "light") seasonId = "light_spring";
    else if (value === "deep") seasonId = "deep_autumn";
    else if (chroma === "muted") seasonId = "soft_autumn";
    else if (chroma === "bright") seasonId = "true_spring";
    else seasonId = "true_autumn";
  } else {
    if (value === "light" && chroma !== "muted") seasonId = "light_summer";
    else if (value === "light") seasonId = "soft_summer";
    else if (value === "deep" && chroma === "bright") seasonId = "bright_winter";
    else if (value === "deep" && chroma === "muted") seasonId = "deep_winter";
    else if (value === "deep") seasonId = "true_winter";
    else if (chroma === "muted") seasonId = "soft_summer";
    else seasonId = "true_summer";
  }

  // Confiança: amostra + força do sinal de temperatura + qualidade da pele
  const tempStrength = Math.min(1, Math.abs(features.temperatureScore) / 15);
  const sampleStrength = Math.min(1, features.sampleCount / 800);
  const skinStrength = Math.min(1, features.skinPixelRatio / 0.08);
  const confidence = Number(
    (0.35 * tempStrength + 0.35 * sampleStrength + 0.3 * skinStrength).toFixed(
      3,
    ),
  );

  return { seasonId, undertoneLabel, confidence };
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

  // Recorte central (rosto tipicamente no centro em selfies)
  const cropLeft = Math.floor(width * 0.25);
  const cropTop = Math.floor(height * 0.12);
  const cropWidth = Math.max(1, Math.floor(width * 0.5));
  const cropHeight = Math.max(1, Math.floor(height * 0.55));

  const { data, info } = await image
    .extract({
      left: Math.min(cropLeft, Math.max(0, width - 1)),
      top: Math.min(cropTop, Math.max(0, height - 1)),
      width: Math.min(cropWidth, width - cropLeft),
      height: Math.min(cropHeight, height - cropTop),
    })
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

  const faceLikeDetected = skinCount >= 80;
  if (!faceLikeDetected) {
    warnings.push(
      "Poucos pixels de pele detectados — centralize o rosto sem maquiagem pesada.",
    );
  }

  // Fallback: usar região central mesmo sem filtro de pele
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

  // Contraste aproximado: dispersão de L*
  const sortedL = [...Lvals].sort((a, b) => a - b);
  const p10 = sortedL[Math.floor(sortedL.length * 0.1)] ?? lab.L;
  const p90 = sortedL[Math.floor(sortedL.length * 0.9)] ?? lab.L;
  const contrastScore = p90 - p10;

  const features: ColorFeatures = {
    lab,
    temperatureScore: Number((lab.b * 0.7 + lab.a * 0.3).toFixed(2)),
    valueScore: Number(lab.L.toFixed(2)),
    chromaScore: Number(chromaFromLab(lab).toFixed(2)),
    contrastScore: Number(contrastScore.toFixed(2)),
    skinPixelRatio: Number((skinCount / Math.max(1, totalPixels)).toFixed(4)),
    sampleCount: labs.length,
  };

  const { seasonId, undertoneLabel, confidence } = classifySeason(features);
  const needsReview = confidence < 0.45 || !faceLikeDetected || lightingWarning;

  const photoQuality: PhotoQuality = {
    width,
    height,
    faceLikeDetected,
    lightingWarning,
    warnings,
  };

  return {
    seasonId,
    confidence,
    undertoneLabel,
    features,
    photoQuality,
    needsReview,
  };
}

/** Classifica a partir de um Lab já conhecido (testes / fixtures). */
export function classifyFromLab(
  lab: LabColor,
  extras?: Partial<ColorFeatures> & { width?: number; height?: number },
): ClassificationResult {
  const features: ColorFeatures = {
    lab,
    temperatureScore: Number((lab.b * 0.7 + lab.a * 0.3).toFixed(2)),
    valueScore: Number(lab.L.toFixed(2)),
    chromaScore: Number(chromaFromLab(lab).toFixed(2)),
    contrastScore: extras?.contrastScore ?? 20,
    skinPixelRatio: extras?.skinPixelRatio ?? 0.12,
    sampleCount: extras?.sampleCount ?? 1000,
  };
  const { seasonId, undertoneLabel, confidence } = classifySeason(features);
  const photoQuality: PhotoQuality = {
    width: extras?.width ?? 800,
    height: extras?.height ?? 800,
    faceLikeDetected: true,
    lightingWarning: false,
    warnings: [],
  };
  return {
    seasonId,
    confidence,
    undertoneLabel,
    features,
    photoQuality,
    needsReview: confidence < 0.45,
  };
}

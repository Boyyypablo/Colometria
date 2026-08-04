/** Confiança do preditor `rules` — nunca afirma certeza absoluta. */
export function calibrateRulesConfidence(input: {
  temperatureScore: number;
  sampleCount: number;
  skinPixelRatio: number;
  detectorProvider: string;
  hasReliableFace: boolean;
  hasHairSample?: boolean;
  contrastScore?: number;
}): number {
  const tempStrength = Math.min(1, Math.abs(input.temperatureScore) / 15);
  const ambiguousUndertone = Math.abs(input.temperatureScore) < 3;
  const sampleStrength = Math.min(1, input.sampleCount / 800);
  const skinStrength = Math.min(1, input.skinPixelRatio / 0.08);
  const faceBoost = input.hasReliableFace ? 0.05 : 0;
  const hairBoost = input.hasHairSample ? 0.03 : 0;
  const contrastBoost =
    input.contrastScore != null && input.contrastScore >= 12 ? 0.02 : 0;
  const heuristicPenalty =
    input.detectorProvider.includes("heuristic") ||
    input.detectorProvider.includes("fallback") ||
    input.detectorProvider === "test"
      ? 0.1
      : 0;
  const ambiguityPenalty = ambiguousUndertone ? 0.18 : 0;

  const raw =
    0.35 * tempStrength +
    0.35 * sampleStrength +
    0.3 * skinStrength +
    faceBoost +
    hairBoost +
    contrastBoost -
    heuristicPenalty -
    ambiguityPenalty;

  // Cap: regras sozinhas não passam de 85%
  return Number(Math.max(0.05, Math.min(0.85, raw)).toFixed(3));
}

export const REVIEW_CONFIDENCE_THRESHOLD = 0.55;

export function shouldNeedsReview(input: {
  confidence: number;
  temperatureScore: number;
  faceLikeDetected: boolean;
  lightingWarning: boolean;
  usedFaceFallback: boolean;
  roiConsistencyWarning?: boolean;
  qualityBand?: "boa" | "aceitavel" | "ruim";
}): boolean {
  return (
    input.confidence < REVIEW_CONFIDENCE_THRESHOLD ||
    !input.faceLikeDetected ||
    input.lightingWarning ||
    input.usedFaceFallback ||
    Math.abs(input.temperatureScore) < 3 ||
    Boolean(input.roiConsistencyWarning) ||
    input.qualityBand === "ruim"
  );
}

export function formatConfidence(confidence: number): {
  percent: number;
  band: "baixa" | "moderada" | "alta";
  note: string;
} {
  // Nunca exibir 100% em estimativa automática (cap de regras = 85%)
  const capped = Math.min(confidence, 0.85);
  const percent = Math.round(capped * 100);
  if (capped < REVIEW_CONFIDENCE_THRESHOLD) {
    return {
      percent,
      band: "baixa",
      note: "revisão recomendada",
    };
  }
  if (capped < 0.72) {
    return {
      percent,
      band: "moderada",
      note: "estimativa automática",
    };
  }
  return {
    percent,
    band: "alta",
    note: "estimativa automática — validação da consultora confirma",
  };
}

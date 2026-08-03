import type { ColorFeatures } from "../types";
import type { ColorPredictor } from "./types";
import { calibrateRulesConfidence } from "../confidence";

/** Árvore de regras atual — baseline estável até o modelo tabular existir. */
export class RulesColorPredictor implements ColorPredictor {
  readonly id = "rules";

  predict(features: ColorFeatures) {
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

    const confidence = calibrateRulesConfidence({
      temperatureScore: features.temperatureScore,
      sampleCount: features.sampleCount,
      skinPixelRatio: features.skinPixelRatio,
      detectorProvider: features.detectorProvider,
      hasReliableFace: Boolean(
        features.faceBox && !features.detectorProvider.includes("fallback"),
      ),
    });

    return { seasonId, undertoneLabel, confidence };
  }
}

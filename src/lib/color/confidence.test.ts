import { describe, expect, it } from "vitest";
import {
  calibrateRulesConfidence,
  formatConfidence,
  shouldNeedsReview,
} from "@/lib/color/confidence";

describe("calibrateRulesConfidence", () => {
  it("nunca passa de 85%", () => {
    const c = calibrateRulesConfidence({
      temperatureScore: 20,
      sampleCount: 5000,
      skinPixelRatio: 0.5,
      detectorProvider: "blazeface",
      hasReliableFace: true,
    });
    expect(c).toBeLessThanOrEqual(0.85);
  });

  it("penaliza heuristic e subtom ambíguo", () => {
    const strong = calibrateRulesConfidence({
      temperatureScore: 12,
      sampleCount: 1000,
      skinPixelRatio: 0.12,
      detectorProvider: "blazeface",
      hasReliableFace: true,
    });
    const weak = calibrateRulesConfidence({
      temperatureScore: 1,
      sampleCount: 1000,
      skinPixelRatio: 0.12,
      detectorProvider: "heuristic",
      hasReliableFace: true,
    });
    expect(weak).toBeLessThan(strong);
  });
});

describe("shouldNeedsReview", () => {
  it("exige revisão com confiança baixa ou subtom ambíguo", () => {
    expect(
      shouldNeedsReview({
        confidence: 0.4,
        temperatureScore: 10,
        faceLikeDetected: true,
        lightingWarning: false,
        usedFaceFallback: false,
      }),
    ).toBe(true);
    expect(
      shouldNeedsReview({
        confidence: 0.8,
        temperatureScore: 1,
        faceLikeDetected: true,
        lightingWarning: false,
        usedFaceFallback: false,
      }),
    ).toBe(true);
  });
});

describe("formatConfidence", () => {
  it("rotula faixas", () => {
    expect(formatConfidence(0.4).band).toBe("baixa");
    expect(formatConfidence(0.65).band).toBe("moderada");
    expect(formatConfidence(0.8).band).toBe("alta");
  });

  it("nunca mostra 100% na UI", () => {
    expect(formatConfidence(1).percent).toBe(85);
    expect(formatConfidence(0.99).percent).toBe(85);
  });
});

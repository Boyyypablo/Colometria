import { describe, expect, it } from "vitest";
import { rgbToLab, chromaFromLab } from "@/lib/color/cielab";
import { classifyFromLab } from "@/lib/color/classifier";

describe("rgbToLab", () => {
  it("mapeia branco para L alto", () => {
    const lab = rgbToLab(255, 255, 255);
    expect(lab.L).toBeGreaterThan(95);
  });

  it("pele quente tende a b* positivo", () => {
    const lab = rgbToLab(210, 160, 120);
    expect(lab.b).toBeGreaterThan(0);
  });

  it("pele fria/rosada tende a a* positivo com b* menor", () => {
    const warm = rgbToLab(210, 160, 120);
    const cool = rgbToLab(200, 150, 150);
    expect(cool.b).toBeLessThan(warm.b);
  });
});

describe("classifyFromLab", () => {
  it("classifica Lab quente/claro/brilhante como primavera", () => {
    const result = classifyFromLab(
      { L: 72, a: 12, b: 28 },
      { sampleCount: 1200, skinPixelRatio: 0.15 },
    );
    expect(result.seasonId).toMatch(/spring|autumn/);
    expect(result.undertoneLabel).toMatch(/quente/);
    expect(result.confidence).toBeGreaterThan(0.4);
  });

  it("classifica Lab frio/profundo como inverno", () => {
    const result = classifyFromLab(
      { L: 42, a: 8, b: -6 },
      { sampleCount: 1200, skinPixelRatio: 0.15, contrastScore: 35 },
    );
    expect(result.seasonId).toMatch(/winter|summer/);
    expect(result.undertoneLabel).toMatch(/frio/);
  });

  it("classifica Lab frio/claro/suave como verão", () => {
    const result = classifyFromLab(
      { L: 74, a: 4, b: -8 },
      { sampleCount: 1000, skinPixelRatio: 0.12 },
    );
    expect(["light_summer", "soft_summer", "true_summer"]).toContain(
      result.seasonId,
    );
  });

  it("classifica Lab quente/profundo como outono profundo", () => {
    const result = classifyFromLab(
      { L: 40, a: 14, b: 22 },
      { sampleCount: 900, skinPixelRatio: 0.1 },
    );
    expect(result.seasonId).toBe("deep_autumn");
  });

  it("contraste alto em frio médio/brilhante puxa inverno", () => {
    const result = classifyFromLab(
      { L: 55, a: 6, b: -10 },
      { sampleCount: 1200, skinPixelRatio: 0.15, contrastScore: 36 },
    );
    expect(result.seasonId).toMatch(/winter|summer/);
  });

  it("contraste alto + cabelo escuro → Inverno Brilhante (não Primavera Clara)", () => {
    // Caso real: pele clara, subtom pele “quente” por luz, cabelo escuro, contraste ~47
    const result = classifyFromLab(
      { L: 68, a: 14, b: 18 },
      {
        sampleCount: 1200,
        skinPixelRatio: 0.15,
        contrastScore: 47,
        labHair: { L: 22, a: 4, b: 2 },
        detectorProvider: "heuristic",
      },
    );
    expect(result.seasonId).toBe("bright_winter");
    expect(result.undertoneLabel).toMatch(/frio/);
    expect(result.confidence).toBeLessThanOrEqual(0.85);
  });

  it("contraste alto sem cabelo não cai em primavera clara", () => {
    const result = classifyFromLab(
      { L: 72, a: 10, b: 16 },
      {
        sampleCount: 1000,
        skinPixelRatio: 0.12,
        contrastScore: 40,
      },
    );
    expect(result.seasonId).not.toBe("light_spring");
  });
});

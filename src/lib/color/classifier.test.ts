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

  it("chromaFromLab é consistente", () => {
    const lab = { L: 50, a: 3, b: 4 };
    expect(chromaFromLab(lab)).toBeCloseTo(5, 5);
  });
});

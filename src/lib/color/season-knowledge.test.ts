import { describe, expect, it } from "vitest";
import {
  buildRecommendations,
  getSeasonById,
} from "@/lib/color/recommendations";
import {
  buildSeasonCoaching,
  contrastBandFromScore,
  SISTER_SEASONS,
} from "@/lib/color/season-knowledge";

describe("season-knowledge", () => {
  it("contraste mapeia faixas", () => {
    expect(contrastBandFromScore(30)).toBe("high");
    expect(contrastBandFromScore(20)).toBe("medium");
    expect(contrastBandFromScore(10)).toBe("low");
  });

  it("inverno brilhante tem irmã primavera brilhante", () => {
    expect(SISTER_SEASONS.bright_winter).toBe("bright_spring");
    const season = getSeasonById("bright_winter")!;
    const coaching = buildSeasonCoaching(season, {
      contrastScore: 32,
      getSeasonName: (id) => getSeasonById(id)?.namePt,
    });
    expect(coaching.sisterSeasonId).toBe("bright_spring");
    expect(coaching.sisterNote).toMatch(/Primavera Brilhante/i);
    expect(coaching.avoidNotes.join(" ")).toMatch(/Outono Suave/i);
    expect(coaching.styleTips.join(" ")).toMatch(/brilho|óptico|optic|cetim/i);
  });
});

describe("buildRecommendations + material", () => {
  it("entrega coaching e cabelo quando pedido", () => {
    const season = getSeasonById("bright_winter")!;
    const rec = buildRecommendations(season, "casual", {
      goals: ["harmonia", "cabelo", "roupas"],
      skinLab: { L: 48, a: 8, b: -6 },
      contrastScore: 34,
      temperatureScore: -10,
    });
    expect(rec.coaching.hairTips.length).toBeGreaterThan(0);
    expect(rec.coaching.colorimetryHairNotes.join(" ")).toMatch(/violeta|dourado/i);
    expect(rec.useColors[0]).toBeTruthy();
    expect(rec.description).toMatch(/brilhante|Clear Winter|Vivo/i);
  });

  it("omite tips de cabelo se o objetivo não pedir", () => {
    const season = getSeasonById("bright_winter")!;
    const rec = buildRecommendations(season, "casual", {
      goals: ["harmonia"],
      contrastScore: 20,
    });
    expect(rec.coaching.hairTips).toEqual([]);
    expect(rec.coaching.styleTips.length).toBeGreaterThan(0);
  });
});

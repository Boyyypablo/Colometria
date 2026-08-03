import { SEASON_PALETTES } from "../../../data/palettes/seasons";
import { buildSkinCorrection } from "./skin-correction";
import type { SeasonDefinition } from "./types";

export function getSeasonById(id: string): SeasonDefinition | undefined {
  return SEASON_PALETTES.find((s) => s.id === id);
}

export function buildRecommendations(
  season: SeasonDefinition,
  context: "trabalho" | "casual" | "noite" = "casual",
  opts?: { temperatureScore?: number },
) {
  const clothing = season.clothing.filter(
    (c) => !c.context || c.context.includes(context),
  );
  const skinCorrection = buildSkinCorrection({
    temperature: season.temperature,
    temperatureScore: opts?.temperatureScore,
  });

  return {
    seasonId: season.id,
    seasonName: season.namePt,
    description: season.description,
    undertoneHint:
      season.temperature === "warm"
        ? "Prefira metais dourados e tons terrosos/amarelados."
        : "Prefira metais pratas e tons rosados/azulados.",
    useColors: season.useColors,
    avoidColors: season.avoidColors,
    clothing: clothing.length > 0 ? clothing : season.clothing,
    lipstick: season.lipstick,
    eyeshadow: season.eyeshadow,
    base: season.base,
    skinCorrection,
    ethicalNote:
      "Harmonia sazonal e correção da pele são camadas distintas: a estação orienta cores que combinam; a correção ajuda a disfarçar olheiras, manchas e vermelhidão. Não é regra absoluta nem diagnóstico dermatológico.",
    context,
  };
}

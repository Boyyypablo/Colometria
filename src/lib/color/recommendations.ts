import { SEASON_PALETTES } from "../../../data/palettes/seasons";
import type { SeasonDefinition } from "./types";

export function getSeasonById(id: string): SeasonDefinition | undefined {
  return SEASON_PALETTES.find((s) => s.id === id);
}

export function buildRecommendations(
  season: SeasonDefinition,
  context: "trabalho" | "casual" | "noite" = "casual",
) {
  const clothing = season.clothing.filter(
    (c) => !c.context || c.context.includes(context),
  );
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
    ethicalNote:
      "Esta análise é uma orientação baseada em atributos cromáticos (matiz, valor e croma). Não é uma regra absoluta — use como ferramenta de harmonia, não de restrição.",
    context,
  };
}

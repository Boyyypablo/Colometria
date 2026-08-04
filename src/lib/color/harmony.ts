import type {
  ColorSwatch,
  LabColor,
  SeasonDefinition,
  Temperature,
  ValueLevel,
  ChromaLevel,
} from "./types";
import {
  chromaFromLab,
  deltaE76,
  hexToLab,
  temperatureFromLab,
} from "./cielab";

export type RankedColor = {
  hex: string;
  label?: string;
  score: number;
  why: string;
};

export type PersonalHarmonyInput = {
  skinLab: LabColor;
  temperature: Temperature;
  value: ValueLevel;
  chroma: ChromaLevel;
  temperatureScore?: number;
};

function whyForScore(
  fabric: LabColor,
  skin: LabColor,
  score: number,
  temperature: Temperature,
): string {
  const dL = Math.abs(fabric.L - skin.L);
  const fabricTemp = temperatureFromLab(fabric);
  const aligned =
    temperature === "warm" ? fabricTemp >= -4 : fabricTemp <= 4;

  if (score >= 72) {
    if (aligned && dL >= 15) {
      return "Harmoniza com seu subtom e cria contraste limpo com a pele.";
    }
    return "Combina bem com o tom medido da sua pele.";
  }
  if (score >= 55) {
    return aligned
      ? "Boa opção — contraste moderado com a pele."
      : "Usável, mas puxa um pouco contra o seu subtom.";
  }
  if (dL < 10) {
    return "Muito próximo do tom da pele — pode apagar o rosto.";
  }
  if (!aligned) {
    return temperature === "warm"
      ? "Tom frio/azulado demais para o seu subtom quente."
      : "Tom quente/alaranjado demais para o seu subtom frio.";
  }
  return "Contraste ou saturação pouco favoráveis para você.";
}

/**
 * Pontua uma cor de tecido/maquiagem contra a pele medida (0–100).
 * Não substitui a estação — só reordena candidatos da paleta.
 */
export function scoreColorAgainstSkin(
  skin: LabColor,
  hex: string,
  input: Pick<PersonalHarmonyInput, "temperature" | "chroma">,
): { score: number; why: string; fabric: LabColor } {
  const fabric = hexToLab(hex);
  const dE = deltaE76(skin, fabric);
  const dL = Math.abs(fabric.L - skin.L);
  const fabricTemp = temperatureFromLab(fabric);
  const fabricChroma = chromaFromLab(fabric);

  const tempAlign =
    input.temperature === "warm"
      ? fabricTemp >= 2
        ? 1
        : fabricTemp >= -6
          ? 0.55
          : 0.22
      : fabricTemp <= -2
        ? 1
        : fabricTemp <= 6
          ? 0.55
          : 0.22;

  const contrastFit =
    dL < 8 ? 0.28 : dL < 14 ? 0.65 : dL < 42 ? 1 : dL < 55 ? 0.8 : 0.55;

  const uniqueness = dE < 10 ? 0.3 : dE < 16 ? 0.6 : 1;

  const chromaFit =
    input.chroma === "bright"
      ? fabricChroma >= 18
        ? 1
        : 0.75
      : input.chroma === "muted"
        ? fabricChroma <= 28
          ? 1
          : 0.55
        : fabricChroma <= 40
          ? 1
          : 0.7;

  const raw =
    0.48 * tempAlign + 0.28 * contrastFit + 0.14 * uniqueness + 0.1 * chromaFit;

  const score = Number((Math.max(0, Math.min(1, raw)) * 100).toFixed(1));

  return {
    score,
    why: whyForScore(fabric, skin, score, input.temperature),
    fabric,
  };
}

export function rankHexColors(
  hexes: string[],
  input: PersonalHarmonyInput,
  limit = 8,
): RankedColor[] {
  const seen = new Set<string>();
  const ranked: RankedColor[] = [];
  for (const hex of hexes) {
    const key = hex.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const { score, why } = scoreColorAgainstSkin(input.skinLab, hex, input);
    ranked.push({ hex, score, why });
  }
  return ranked.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function rankSwatches(
  swatches: ColorSwatch[],
  input: PersonalHarmonyInput,
  limit?: number,
): Array<ColorSwatch & { score: number; why: string }> {
  const ranked = swatches.map((s) => {
    const { score, why } = scoreColorAgainstSkin(input.skinLab, s.hex, input);
    return { ...s, score, why };
  });
  ranked.sort((a, b) => b.score - a.score);
  return limit ? ranked.slice(0, limit) : ranked;
}

/** Ordena bases pela proximidade de L* à pele (cobertura natural). */
export function rankBasesBySkinValue(
  bases: ColorSwatch[],
  skinL: number,
): Array<ColorSwatch & { score: number; why: string }> {
  return [...bases]
    .map((b) => {
      const lab = hexToLab(b.hex);
      const dL = Math.abs(lab.L - skinL);
      const score = Number((Math.max(0, 100 - dL * 2.2)).toFixed(1));
      return {
        ...b,
        score,
        why:
          dL <= 6
            ? "Próxima do valor (L*) da sua pele — boa base de partida."
            : dL <= 14
              ? "Valor próximo; ajuste fino com corretivo se precisar."
              : "Mais clara/escura que sua pele medida — use com cuidado.",
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function harmonyInputFromSeason(
  season: SeasonDefinition,
  skinLab: LabColor,
  temperatureScore?: number,
): PersonalHarmonyInput {
  return {
    skinLab,
    temperature: season.temperature,
    value: season.value,
    chroma: season.chroma,
    temperatureScore,
  };
}

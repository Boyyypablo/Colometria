import type { Temperature } from "./types";

export type SkinConcern =
  | "olheiras"
  | "manchas"
  | "vermelhidao"
  | "cobertura";

export type SkinCorrectionRole =
  | "corretor"
  | "base"
  | "iluminador"
  | "evitar_local";

export type SkinCorrectionItem = {
  concern: SkinConcern;
  role: SkinCorrectionRole;
  hex: string;
  label: string;
  why: string;
  /** Target canônico para FeedbackEvent: correction:olheiras:#HEX */
  target: string;
};

export type SkinCorrectionBlock = {
  intro: string;
  items: SkinCorrectionItem[];
};

function item(
  concern: SkinConcern,
  role: SkinCorrectionRole,
  hex: string,
  label: string,
  why: string,
): SkinCorrectionItem {
  return {
    concern,
    role,
    hex,
    label,
    why,
    target: `correction:${concern}:${hex}`,
  };
}

/**
 * Camada de correção da pele — independente da harmonia sazonal.
 * Objetivo: disfarçar olheiras, manchas e vermelhidão com corretivos por subtom.
 */
export function buildSkinCorrection(input: {
  temperature: Temperature;
  temperatureScore?: number;
}): SkinCorrectionBlock {
  const warm =
    input.temperature === "warm" ||
    (input.temperatureScore != null && input.temperatureScore >= 0);

  const intro = warm
    ? "Correção da pele (subtom quente): neutralize olheiras e manchas antes da base — a estação define harmonia; estes tons disfarçam o que a câmera evidencia."
    : "Correção da pele (subtom frio): neutralize olheiras e manchas antes da base — a estação define harmonia; estes tons disfarçam o que a câmera evidencia.";

  const items: SkinCorrectionItem[] = warm
    ? [
        item(
          "olheiras",
          "corretor",
          "#E8A07A",
          "Corretivo pêssego",
          "Olheiras azuladas/acinzentadas: pêssego cancela o azul no subtom quente.",
        ),
        item(
          "olheiras",
          "corretor",
          "#D9896A",
          "Corretivo salmão",
          "Olheiras profundas ou violáceas: salmão cobre sem acinzentar.",
        ),
        item(
          "manchas",
          "corretor",
          "#C4A484",
          "Corretivo bege quente",
          "Manchas e hiperpigmentação: equaliza local antes da base.",
        ),
        item(
          "vermelhidao",
          "corretor",
          "#B8D4A8",
          "Corretivo verde suave",
          "Vermelhidão / acne: verde cancela vermelho; use só no ponto.",
        ),
        item(
          "cobertura",
          "base",
          "#F0D5B8",
          "Base marfim quente média",
          "Base com cobertura média no tom da pele — evita ivory claro demais que marca olheira.",
        ),
        item(
          "cobertura",
          "iluminador",
          "#F5E6D3",
          "Iluminador champanhe interno",
          "Ponto interno do canto do olho: reduz sombra sem glitter.",
        ),
        item(
          "olheiras",
          "evitar_local",
          "#1A1A1A",
          "Evitar preto no rosto / drapeado",
          "Preto sob o queixo acentua olheira e contraste — use neutro médio no teste.",
        ),
      ]
    : [
        item(
          "olheiras",
          "corretor",
          "#E5A8A0",
          "Corretivo rosa-pêssego",
          "Olheiras azuladas em subtom frio: rosa-pêssego cancela sem amarelar.",
        ),
        item(
          "olheiras",
          "corretor",
          "#C9B8D4",
          "Corretivo lavanda suave",
          "Olheiras amareladas/marrons: lavanda clareia o tom antes da base.",
        ),
        item(
          "manchas",
          "corretor",
          "#D4B8A8",
          "Corretivo bege rosado",
          "Manchas: equaliza sem puxar para amarelo.",
        ),
        item(
          "vermelhidao",
          "corretor",
          "#A8C9B0",
          "Corretivo verde suave",
          "Vermelhidão: verde pontual; finalize com base fria.",
        ),
        item(
          "cobertura",
          "base",
          "#E8D4CC",
          "Base porcelana rosada média",
          "Base com cobertura média alinhada ao subtom frio.",
        ),
        item(
          "cobertura",
          "iluminador",
          "#F2E8E4",
          "Iluminador pérola fria",
          "Canto interno do olho: reduz sombra sem brilho dourado.",
        ),
        item(
          "olheiras",
          "evitar_local",
          "#1A1A1A",
          "Evitar preto no rosto / drapeado",
          "Preto sob o queixo acentua olheira — prefira cinza médio no teste.",
        ),
      ];

  return { intro, items };
}

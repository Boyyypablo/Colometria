import type { Temperature } from "./types";
import type { AnalysisGoalId } from "./goals";
import { skinConcernsFromGoals, wantsSkinCorrection } from "./goals";
import { hexToLab } from "./cielab";

export type SkinConcern =
  | "olheiras"
  | "manchas"
  | "vermelhidao"
  | "cobertura";

export type SkinCorrectionRole =
  | "corretor"
  | "base"
  | "iluminador"
  | "evitar_local"
  /** Puxa o olhar para sobrancelha/cabelo — suaviza foco em manchas/olheiras. */
  | "foco_olhar";

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
  concerns: SkinConcern[];
};

const CONCERN_LABEL: Record<SkinConcern, string> = {
  olheiras: "olheiras",
  manchas: "manchas",
  vermelhidao: "vermelhidão",
  cobertura: "base e cobertura",
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

function allItems(warm: boolean): SkinCorrectionItem[] {
  return warm
    ? [
        item(
          "olheiras",
          "corretor",
          "#E8A07A",
          "Corretivo pêssego",
          "Para um olhar mais descansado: o pêssego suaviza tons azulados na área dos olhos.",
        ),
        item(
          "olheiras",
          "corretor",
          "#D9896A",
          "Corretivo salmão",
          "Para olhar mais luminoso: o salmão equilibra tons mais profundos sem endurecer.",
        ),
        item(
          "manchas",
          "corretor",
          "#C4A484",
          "Corretivo bege quente",
          "Para um tom mais uniforme: equaliza suavemente pontos mais escuros antes da base.",
        ),
        item(
          "vermelhidao",
          "corretor",
          "#B8D4A8",
          "Corretivo verde suave",
          "Para acalmar o rubor: um toque de verde suaviza o vermelho — só no ponto.",
        ),
        item(
          "cobertura",
          "base",
          "#F0D5B8",
          "Base marfim quente média",
          "Base com cobertura média no seu tom — evita marfim claro demais que marca sombra.",
        ),
        item(
          "cobertura",
          "iluminador",
          "#F5E6D3",
          "Iluminador champanhe interno",
          "Um ponto de luz no canto interno do olho: olhar mais aberto, sem glitter.",
        ),
        item(
          "olheiras",
          "evitar_local",
          "#1A1A1A",
          "Evitar preto perto do rosto (no teste de cores)",
          "Preto sob o queixo aumenta contraste no olhar — no teste, prefira um neutro médio.",
        ),
      ]
    : [
        item(
          "olheiras",
          "corretor",
          "#E5A8A0",
          "Corretivo rosa-pêssego",
          "Para um olhar mais descansado em subtom frio: rosa-pêssego suaviza sem amarelar.",
        ),
        item(
          "olheiras",
          "corretor",
          "#C9B8D4",
          "Corretivo lavanda suave",
          "Para iluminar o olhar: lavanda equilibra tons amarelados ou acastanhados.",
        ),
        item(
          "manchas",
          "corretor",
          "#D4B8A8",
          "Corretivo bege rosado",
          "Para um tom mais uniforme: equaliza com delicadeza, sem puxar para amarelo.",
        ),
        item(
          "vermelhidao",
          "corretor",
          "#A8C9B0",
          "Corretivo verde suave",
          "Para acalmar o rubor: verde pontual; finalize com base no seu subtom.",
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
          "Luz no canto interno do olho: olhar mais aberto, sem brilho dourado.",
        ),
        item(
          "olheiras",
          "evitar_local",
          "#1A1A1A",
          "Evitar preto perto do rosto (no teste de cores)",
          "Preto sob o queixo aumenta contraste no olhar — prefira cinza médio no teste.",
        ),
      ];
}

/** Cores/gestos que desviam o olhar para sobrancelha e cabelo. */
function focusAttentionItems(
  warm: boolean,
  primary: SkinConcern,
): SkinCorrectionItem[] {
  const whyBase =
    "Cores e definição em sobrancelha e cabelo puxam o olhar para cima — ajudam a suavizar o foco em manchas, espinhas ou olheiras.";
  return warm
    ? [
        item(
          primary,
          "foco_olhar",
          "#5C4033",
          "Sobrancelha definida (marrom quente)",
          `${whyBase} Prefira um marrom alinhado ao seu subtom quente, bem preenchido, sem exagero.`,
        ),
        item(
          primary,
          "foco_olhar",
          "#C45C26",
          "Brilho no cabelo / cobre suave",
          `${whyBase} Um reflexo ou acessório quente perto do cabelo desvia a atenção da pele.`,
        ),
        item(
          primary,
          "foco_olhar",
          "#D4AF37",
          "Brinco dourado perto do rosto",
          `${whyBase} Metal dourado polido na altura dos olhos/cabelo reforça o ponto de luz desejado.`,
        ),
      ]
    : [
        item(
          primary,
          "foco_olhar",
          "#3D2914",
          "Sobrancelha definida (marrom frio)",
          `${whyBase} Marrom frio/acinzentado valoriza o olhar sem aquecer demais o rosto.`,
        ),
        item(
          primary,
          "foco_olhar",
          "#1A1A2E",
          "Contraste no cabelo (brilho ou definição)",
          `${whyBase} Mecha marcada, raiz bem cuidada ou acabamento com brilho sobem o ponto de interesse.`,
        ),
        item(
          primary,
          "foco_olhar",
          "#C0C0C0",
          "Brinco prata/platina perto do rosto",
          `${whyBase} Metal frio brilhante na linha dos olhos/cabelo redireciona o olhar.`,
        ),
      ];
}

/**
 * Camada de cuidado com a pele — só quando a pessoa pediu no upload.
 */
export function buildSkinCorrection(input: {
  temperature: Temperature;
  temperatureScore?: number;
  /** L* da pele — ajusta prioridade das bases. */
  skinL?: number;
  /** Se vazio / não quer correção → null */
  goals?: AnalysisGoalId[] | string[];
  concerns?: SkinConcern[];
}): SkinCorrectionBlock | null {
  const concerns =
    input.concerns ??
    (input.goals ? skinConcernsFromGoals(input.goals) : undefined);

  if (input.goals && !wantsSkinCorrection(input.goals)) {
    return null;
  }
  if (concerns && concerns.length === 0) {
    return null;
  }

  const warm =
    input.temperature === "warm" ||
    (input.temperatureScore != null && input.temperatureScore >= 0);

  const active = concerns
    ? new Set(concerns)
    : new Set<SkinConcern>(["olheiras", "manchas", "vermelhidao", "cobertura"]);

  let items = allItems(warm).filter((i) => active.has(i.concern));

  const focusConcern: SkinConcern | null = active.has("olheiras")
    ? "olheiras"
    : active.has("manchas")
      ? "manchas"
      : active.has("vermelhidao")
        ? "vermelhidao"
        : null;
  if (focusConcern) {
    items = [...items, ...focusAttentionItems(warm, focusConcern)];
  }

  if (items.length === 0) return null;

  if (input.skinL != null) {
    items = [...items].sort((a, b) => {
      if (a.role === "foco_olhar" && b.role !== "foco_olhar") return 1;
      if (b.role === "foco_olhar" && a.role !== "foco_olhar") return -1;
      if (a.role !== "base" && b.role !== "base") return 0;
      if (a.role === "base" && b.role !== "base") return -1;
      if (b.role === "base" && a.role !== "base") return 1;
      const dA = Math.abs(hexToLab(a.hex).L - input.skinL!);
      const dB = Math.abs(hexToLab(b.hex).L - input.skinL!);
      return dA - dB;
    });
  }

  const labels = [...active].map((c) => CONCERN_LABEL[c]).join(", ");
  const focusNote = focusConcern
    ? " Além do corretivo: cores que destacam sobrancelha e cabelo ajudam a suavizar o foco em manchas, espinhas ou olheiras."
    : "";
  const intro = warm
    ? `Cuidados com a pele (subtom quente) — foco: ${labels}.${focusNote} A estação cuida da harmonia; aqui entram só as escolhas que você pediu.`
    : `Cuidados com a pele (subtom frio) — foco: ${labels}.${focusNote} A estação cuida da harmonia; aqui entram só as escolhas que você pediu.`;

  return { intro, items, concerns: [...active] };
}

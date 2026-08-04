import type { SeasonDefinition, Temperature } from "./types";

export type ContrastBand = "low" | "medium" | "high";

/** Limiares alinhados ao preditor de regras (contraste pele×cabelo/olhos). */
export function contrastBandFromScore(score: number): ContrastBand {
  if (score >= 28) return "high";
  if (score <= 14) return "low";
  return "medium";
}

export function contrastBandLabel(band: ContrastBand): string {
  if (band === "high") return "alto";
  if (band === "low") return "baixo";
  return "médio";
}

/**
 * Cartelas irmãs: mesma característica dominante (brilho/suavidade/profundidade),
 * temperatura oposta — material coloração pessoal (ex.: Inverno Brilhante ↔ Primavera Brilhante).
 */
export const SISTER_SEASONS: Record<string, string> = {
  bright_winter: "bright_spring",
  bright_spring: "bright_winter",
  soft_autumn: "soft_summer",
  soft_summer: "soft_autumn",
  deep_autumn: "deep_winter",
  deep_winter: "deep_autumn",
  light_spring: "light_summer",
  light_summer: "light_spring",
  true_spring: "true_winter",
  true_winter: "true_spring",
  true_autumn: "true_summer",
  true_summer: "true_autumn",
};

export type SeasonCoaching = {
  sisterSeasonId: string | null;
  sisterNamePt: string | null;
  sisterNote: string | null;
  styleTips: string[];
  makeupTips: string[];
  hairTips: string[];
  avoidNotes: string[];
  offPaletteTips: string[];
  contrastTip: string | null;
  /** Fundamentos capilares (quente/frio) — material Vanessa Cardozo. */
  colorimetryHairNotes: string[];
  /**
   * Quando há preocupação com manchas/olheiras/espinhas:
   * cores que destacam sobrancelha e cabelo redirecionam o olhar.
   */
  attentionRedirectTips: string[];
};

const OFF_PALETTE_GENERIC = [
  "Use peças da sua cartela perto do rosto (blusa, lenço, brinco).",
  "Cores fora da paleta funcionam melhor longe do rosto (calça, saia, sapato).",
  "Uma terceira peça da cartela (blazer, casaco, kimono) harmoniza looks mistos.",
  "Você não precisa usar todas as cores da paleta — escolha as que combinam com seu estilo.",
];

/** Óculos por contraste (material Inverno Brilhante; aplicável a cartelas frias/escuras). */
function glassesTip(band: ContrastBand, temperature: Temperature): string {
  if (band === "high") {
    return temperature === "cool"
      ? "Óculos: armações intensas (violeta, cerceta, verde vivo) valorizam contraste alto."
      : "Óculos: armações vivas e saturadas combinam com seu contraste alto.";
  }
  if (band === "low") {
    return temperature === "cool"
      ? "Óculos: em contraste baixo, prefira neutros (grafite, vinho, café, azul-marinho) ou tons claros suaves se a pele for clara."
      : "Óculos: contraste baixo pede armações mais suaves e próximas ao tom da pele/cabelo.";
  }
  return "Óculos: café, vinho, grafite e azul-marinho costumam equilibrar contraste médio.";
}

function hairNotesForTemperature(temperature: Temperature): string[] {
  if (temperature === "cool") {
    return [
      "Para neutralizar dourado/amarelo no fio, use violeta (complementar) — cinza sozinho pode gerar mate/opacidade.",
      "Cores frias (cinza, violeta, mate) aumentam profundidade: o cabelo parece um pouco mais escuro.",
      "Um toque de dourado na receita pode devolver brilho mesmo em resultado frio — não confunda dourado (brilho) com fundo amarelo indesejado.",
      "Na cartela: prefira marrons frios/rosados; evite acobreados quentes se a meta for harmonia fria.",
    ];
  }
  return [
    "Cores quentes (dourado, cobre, vermelho) vibram e refletem mais brilho no fio.",
    "Fundo acobreado pode ser aliado em mechas quentes — nem sempre precisa neutralizar por completo.",
    "Complementares: cobre × cinza, vermelho × mate, dourado × violeta — use para suavizar ou intensificar com intenção.",
    "Misture com base na altura de tom desejada; resultado = pigmento + fundo de clareamento (+ residual, se houver).",
  ];
}

type SeasonPack = {
  styleTips: string[];
  makeupTips: string[];
  hairTips: string[];
  avoidNotes: string[];
  sisterNote: (sisterName: string) => string;
};

const PACKS: Partial<Record<string, SeasonPack>> = {
  bright_winter: {
    styleTips: [
      "Característica principal: brilho — branco óptico e preto bem brilhoso (não branco amarelado apagado).",
      "Tecidos com reflexo (cetim e similares) valorizam a cartela.",
      "Estampas: vibrantes, frias e escuras; evite fundo suave e quente.",
      "Jeans: escolha azuis da sua paleta, não um azul genérico.",
      "Metais: pode misturar ouro, ouro branco, prata e platina — priorize acabamento polido/brilhante.",
      "Dourado em joias funciona bem; em roupa perto do rosto o dourado quente destaca demais.",
    ],
    makeupTips: [
      "Aposte em brilho (glossy) — faz parte da sua característica brilhante.",
      "Contorno em neutros frios; blush rosado ou arroxeado.",
      "Sombras neutras: marrons frios (evite cobre); coloridos e vibrantes também funcionam.",
      "Batons vivos da cartela + gloss reforçam o contraste natural.",
      "Base: marrons frios/rosados; pode oscilar entre oliva, neutra ou levemente rosada.",
    ],
    hairTips: [
      "Marrons neutros frios; ruivos aconselhados em marsala e frios.",
      "Morena iluminada/loira: tons neutros (bege/creme), preservar a raiz; mechas marcadas com brilho — não excessivamente esfumadas.",
      "Harmonia: ±2 tons da cor natural; iluminada até cerca de −4 tons.",
      "Fantasia: azul-marinho, rosa frio, marsala, roxo, verde neon — sempre com brilho, inspirados na paleta.",
    ],
    avoidNotes: [
      "Evite tons extremamente quentes e claros demais perto do rosto.",
      "Outono Suave costuma desvalorizar: muita suavidade + calor.",
    ],
    sisterNote: (s) =>
      `Cartela irmã: ${s} — mesmo brilho; ela é clara e quente, você é escura e fria. Pode “roubar” cores escuras/saturadas dela, sem substituir a sua paleta.`,
  },
  bright_spring: {
    styleTips: [
      "Característica principal: brilho quente — cores vivas, claras e saturadas.",
      "Branco limpo e pigmentos dourados/coral funcionam bem.",
      "Evite cinzas frios opacos e pretos sem vida perto do rosto.",
    ],
    makeupTips: [
      "Batons coral e vermelho quente; sombras douradas e verdes vivos.",
      "Base com viés dourado/claro alinhado ao valor alto.",
    ],
    hairTips: [
      "Loiros e mel quentes; cobre e dourado com intenção (brilho).",
      "Evite cinza excessivo que apague a vivacidade.",
    ],
    avoidNotes: [
      "Evite paletas frias profundas e suaves demais (ex.: inverno opaco ou outono suave).",
    ],
    sisterNote: (s) =>
      `Cartela irmã: ${s} — mesmo brilho; ela é fria e escura. Cores intensas frias dela podem funcionar pontualmente.`,
  },
  soft_autumn: {
    styleTips: [
      "Suavidade + calor: terrosos, camel e oliva sem brilho metálico extremo.",
      "Prefira acabamentos mate e estampas suaves.",
    ],
    makeupTips: [
      "Nudes terrosos e terracota suave; evite vermelho óptico gelado.",
    ],
    hairTips: [
      "Castanhos quentes suaves; cobre discreto. Evite platinado frio extremo.",
    ],
    avoidNotes: [
      "Contraste alto com preto/branco óptico e neons frios costuma endurecer o traço.",
    ],
    sisterNote: (s) =>
      `Cartela irmã: ${s} — mesma suavidade, temperatura fria.`,
  },
};

function defaultPack(season: SeasonDefinition): SeasonPack {
  const warm = season.temperature === "warm";
  return {
    styleTips: warm
      ? [
          "Prefira metais dourados e acabamentos que aquecem o rosto.",
          "Tons terrosos, coral e verdes com base amarela costumam valorizar.",
        ]
      : [
          "Prefira metais prateados/platinados e tons rosados/azulados.",
          "Pretos azulados e brancos limpos costumam funcionar melhor que branco amarelado.",
        ],
    makeupTips: warm
      ? [
          "Blush pêssego/coral; contorno quente suave; evite cinza frio no rosto.",
        ]
      : [
          "Blush rosado; contorno frio; evite bronze acobreado forte se a meta for frio.",
        ],
    hairTips: warm
      ? [
          "Dourado e cobre com intenção trazem brilho; fundo de clareamento amarelo/laranja pode ser aliado.",
        ]
      : [
          "Neutralize dourado indesejado com violeta; cuidado com cinza puro (risco de mate).",
        ],
    avoidNotes: warm
      ? ["Evite cinzas frios e magenta gelado perto do rosto."]
      : ["Evite camel, mostarda e cobre queimado perto do rosto."],
    sisterNote: (s) => `Cartela irmã: ${s} — mesma família de valor/croma, temperatura oposta.`,
  };
}

/**
 * Orientações práticas a partir do material de coloração pessoal + colorimetria capilar.
 */
export function buildSeasonCoaching(
  season: SeasonDefinition,
  opts?: {
    contrastScore?: number;
    getSeasonName?: (id: string) => string | undefined;
  },
): SeasonCoaching {
  const band =
    opts?.contrastScore != null
      ? contrastBandFromScore(opts.contrastScore)
      : "medium";
  const pack = PACKS[season.id] ?? defaultPack(season);
  const sisterId = SISTER_SEASONS[season.id] ?? null;
  const sisterName = sisterId
    ? opts?.getSeasonName?.(sisterId) ?? sisterId
    : null;

  return {
    sisterSeasonId: sisterId,
    sisterNamePt: sisterName,
    sisterNote: sisterId && sisterName ? pack.sisterNote(sisterName) : null,
    styleTips: [...pack.styleTips, glassesTip(band, season.temperature)],
    makeupTips: pack.makeupTips,
    hairTips: pack.hairTips,
    avoidNotes: pack.avoidNotes,
    offPaletteTips: OFF_PALETTE_GENERIC,
    contrastTip: `Seu contraste medido está ${contrastBandLabel(band)} — use isso para escolher armações, mechas e o quanto de contraste nas roupas perto do rosto.`,
    colorimetryHairNotes: hairNotesForTemperature(season.temperature),
    attentionRedirectTips: [
      "Defina bem as sobrancelhas com cor da sua cartela — o olhar sobe e manchas/olheiras/espinhas ganham menos destaque.",
      "Cabelo com brilho, contraste ou acessório perto do rosto puxa a atenção para cima.",
      "Brincos e óculos alinhados à paleta reforçam esse desvio de foco (sem precisar cobrir tudo com maquiagem).",
    ],
  };
}

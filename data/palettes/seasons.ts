import type { SeasonDefinition } from "@/lib/color/types";

export const SEASON_PALETTES: SeasonDefinition[] = [
  {
    id: "bright_spring",
    namePt: "Primavera Brilhante",
    nameEn: "Bright Spring",
    temperature: "warm",
    value: "light",
    chroma: "bright",
    description:
      "Subtom quente com alto contraste e cores vivas. Harmoniza com pigmentos claros, dourados e saturados.",
    useColors: ["#FF6B35", "#FFD23F", "#00C2A8", "#FF4D6D", "#7CFF6B", "#FFFFFF"],
    avoidColors: ["#4A5568", "#6B7280", "#1E3A5F", "#7C3AED"],
    clothing: [
      { hex: "#FF6B35", label: "Coral vivo", context: ["casual", "noite"] },
      { hex: "#00C2A8", label: "Turquesa", context: ["casual", "trabalho"] },
      { hex: "#FFD23F", label: "Amarelo sol", context: ["casual"] },
      { hex: "#FFFFFF", label: "Branco puro", context: ["trabalho", "casual"] },
    ],
    lipstick: [
      { hex: "#E85D4C", label: "Coral" },
      { hex: "#C41E3A", label: "Vermelho quente" },
    ],
    eyeshadow: [
      { hex: "#D4A017", label: "Dourado" },
      { hex: "#2E8B57", label: "Verde vivo" },
    ],
    base: [{ hex: "#F5D0A9", label: "Base dourada clara" }],
  },
  {
    id: "true_spring",
    namePt: "Primavera Verdadeira",
    nameEn: "True Spring",
    temperature: "warm",
    value: "medium",
    chroma: "bright",
    description:
      "Caroteno evidente, claridade média e vivacidade. Cores alegres de base amarela.",
    useColors: ["#F4A261", "#E9C46A", "#2A9D8F", "#E76F51", "#F1FAEE"],
    avoidColors: ["#5B21B6", "#1F2937", "#9CA3AF", "#DB2777"],
    clothing: [
      { hex: "#F4A261", label: "Pêssego", context: ["casual"] },
      { hex: "#2A9D8F", label: "Verde-água", context: ["trabalho", "casual"] },
      { hex: "#E76F51", label: "Terracota clara", context: ["noite"] },
    ],
    lipstick: [
      { hex: "#E07A5F", label: "Pêssego rosado" },
      { hex: "#D62828", label: "Vermelho tomate" },
    ],
    eyeshadow: [
      { hex: "#BC6C25", label: "Cobre" },
      { hex: "#457B9D", label: "Azul-quente" },
    ],
    base: [{ hex: "#E8C4A0", label: "Base mel" }],
  },
  {
    id: "light_spring",
    namePt: "Primavera Clara",
    nameEn: "Light Spring",
    temperature: "warm",
    value: "light",
    chroma: "soft",
    description:
      "Quente, clara e delicada. Pastéis quentes e tons translúcidos.",
    useColors: ["#FFC8A2", "#FFE5B4", "#A8DADC", "#F4A7B9", "#FFF8F0"],
    avoidColors: ["#111827", "#7F1D1D", "#3730A3", "#000000"],
    clothing: [
      { hex: "#FFC8A2", label: "Pêssego claro", context: ["casual"] },
      { hex: "#A8DADC", label: "Menta", context: ["trabalho", "casual"] },
      { hex: "#F4A7B9", label: "Rosa chá", context: ["noite"] },
    ],
    lipstick: [
      { hex: "#E8A0BF", label: "Rosa claro" },
      { hex: "#E07A5F", label: "Coral suave" },
    ],
    eyeshadow: [
      { hex: "#E9C46A", label: "Champagne" },
      { hex: "#90BE6D", label: "Verde claro" },
    ],
    base: [{ hex: "#F8E1C7", label: "Base ivory quente" }],
  },
  {
    id: "light_summer",
    namePt: "Verão Claro",
    nameEn: "Light Summer",
    temperature: "cool",
    value: "light",
    chroma: "soft",
    description:
      "Frio, claro e suave. Pastéis acinzentados e rosados refinados.",
    useColors: ["#CDB4DB", "#BDE0FE", "#FFC8DD", "#A2D2FF", "#F8F9FA"],
    avoidColors: ["#F97316", "#CA8A04", "#78350F", "#FF4500"],
    clothing: [
      { hex: "#BDE0FE", label: "Azul bebê", context: ["casual", "trabalho"] },
      { hex: "#CDB4DB", label: "Lavanda", context: ["noite"] },
      { hex: "#FFC8DD", label: "Rosa pó", context: ["casual"] },
    ],
    lipstick: [
      { hex: "#D4739C", label: "Rosa frio" },
      { hex: "#C9184A", label: "Berry suave" },
    ],
    eyeshadow: [
      { hex: "#9B8EA8", label: "Mauve" },
      { hex: "#7EB8DA", label: "Azul suave" },
    ],
    base: [{ hex: "#F5D6D0", label: "Base rosada clara" }],
  },
  {
    id: "true_summer",
    namePt: "Verão Verdadeiro",
    nameEn: "True Summer",
    temperature: "cool",
    value: "medium",
    chroma: "soft",
    description:
      "Subtom frio, contraste médio e saturação moderada. Elegância calma.",
    useColors: ["#457B9D", "#A8DADC", "#E63946", "#1D3557", "#F1FAEE"],
    avoidColors: ["#F4A261", "#D97706", "#365314", "#FFD700"],
    clothing: [
      { hex: "#457B9D", label: "Azul denim", context: ["trabalho", "casual"] },
      { hex: "#E63946", label: "Vermelho frio", context: ["noite"] },
      { hex: "#1D3557", label: "Azul-marinho", context: ["trabalho"] },
    ],
    lipstick: [
      { hex: "#C9184A", label: "Rosa berry" },
      { hex: "#9D0208", label: "Vermelho frio" },
    ],
    eyeshadow: [
      { hex: "#6D6875", label: "Cinza-rosa" },
      { hex: "#4A6FA5", label: "Azul acinzentado" },
    ],
    base: [{ hex: "#E8C9C1", label: "Base rosa média" }],
  },
  {
    id: "soft_summer",
    namePt: "Verão Suave",
    nameEn: "Soft Summer",
    temperature: "cool",
    value: "medium",
    chroma: "muted",
    description:
      "Frio e muted. Tons acinzentados, opacos e sofisticados.",
    useColors: ["#8D99AE", "#B8C0CC", "#ADB5BD", "#6C757D", "#E9ECEF"],
    avoidColors: ["#FF0000", "#00FF00", "#FFD700", "#FF1493"],
    clothing: [
      { hex: "#8D99AE", label: "Cinza-azulado", context: ["trabalho"] },
      { hex: "#ADB5BD", label: "Cinza pérola", context: ["casual", "trabalho"] },
      { hex: "#A98467", label: "Taupe frio", context: ["casual"] },
    ],
    lipstick: [
      { hex: "#9A8C98", label: "Nude mauve" },
      { hex: "#6D597A", label: "Ameixa suave" },
    ],
    eyeshadow: [
      { hex: "#7B6B63", label: "Marrom acinzentado" },
      { hex: "#6C757D", label: "Cinza" },
    ],
    base: [{ hex: "#D9C5B8", label: "Base neutra fria" }],
  },
  {
    id: "soft_autumn",
    namePt: "Outono Suave",
    nameEn: "Soft Autumn",
    temperature: "warm",
    value: "medium",
    chroma: "muted",
    description:
      "Quente e opaco. Terrosos suaves, camel e verde-oliva.",
    useColors: ["#A98467", "#6B705C", "#CB997E", "#DDB892", "#FAEDCD"],
    avoidColors: ["#00FFFF", "#FF00FF", "#0000FF", "#FFFFFF"],
    clothing: [
      { hex: "#A98467", label: "Camel", context: ["trabalho", "casual"] },
      { hex: "#6B705C", label: "Verde oliva", context: ["casual"] },
      { hex: "#CB997E", label: "Areia", context: ["trabalho"] },
    ],
    lipstick: [
      { hex: "#B08968", label: "Nude terroso" },
      { hex: "#9C6644", label: "Terracota" },
    ],
    eyeshadow: [
      { hex: "#7F5539", label: "Marrom quente" },
      { hex: "#A3B18A", label: "Verde musgo" },
    ],
    base: [{ hex: "#E6CCB2", label: "Base dourada média" }],
  },
  {
    id: "true_autumn",
    namePt: "Outono Verdadeiro",
    nameEn: "True Autumn",
    temperature: "warm",
    value: "medium",
    chroma: "bright",
    description:
      "Caroteno forte, profundidade média e riqueza terrosa.",
    useColors: ["#BC6C25", "#DDA15E", "#606C38", "#283618", "#FEFAE0"],
    avoidColors: ["#EC4899", "#3B82F6", "#A78BFA", "#F0F9FF"],
    clothing: [
      { hex: "#BC6C25", label: "Ferrugem", context: ["casual", "noite"] },
      { hex: "#606C38", label: "Verde musgo", context: ["trabalho"] },
      { hex: "#DDA15E", label: "Mostarda", context: ["casual"] },
    ],
    lipstick: [
      { hex: "#9C2A00", label: "Cobre queimado" },
      { hex: "#6F1D1B", label: "Vinho quente" },
    ],
    eyeshadow: [
      { hex: "#BC6C25", label: "Cobre" },
      { hex: "#606C38", label: "Oliva" },
    ],
    base: [{ hex: "#D4A373", label: "Base bronze" }],
  },
  {
    id: "deep_autumn",
    namePt: "Outono Profundo",
    nameEn: "Deep Autumn",
    temperature: "warm",
    value: "deep",
    chroma: "muted",
    description:
      "Quente, escuro e rico. Madeiras, café e dourados envelhecidos.",
    useColors: ["#582F0E", "#7F4F24", "#414833", "#A68A64", "#1B1B1B"],
    avoidColors: ["#BAE6FD", "#FCE7F3", "#E0E7FF", "#FDE68A"],
    clothing: [
      { hex: "#582F0E", label: "Café", context: ["trabalho", "noite"] },
      { hex: "#414833", label: "Verde floresta", context: ["casual"] },
      { hex: "#7F4F24", label: "Marrom rico", context: ["trabalho"] },
    ],
    lipstick: [
      { hex: "#6A040F", label: "Vinho escuro" },
      { hex: "#9C2A00", label: "Ferrugem profunda" },
    ],
    eyeshadow: [
      { hex: "#3D2914", label: "Marrom profundo" },
      { hex: "#344E41", label: "Verde escuro" },
    ],
    base: [{ hex: "#8B5E3C", label: "Base bronze profunda" }],
  },
  {
    id: "bright_winter",
    namePt: "Inverno Brilhante",
    nameEn: "Bright Winter",
    temperature: "cool",
    value: "deep",
    chroma: "bright",
    description:
      "Frio, alto contraste e cores puras e dramáticas.",
    useColors: ["#000000", "#FFFFFF", "#E63946", "#023E8A", "#7B2CBF"],
    avoidColors: ["#D4A373", "#A98467", "#FEFAE0", "#BC6C25"],
    clothing: [
      { hex: "#000000", label: "Preto", context: ["trabalho", "noite"] },
      { hex: "#FFFFFF", label: "Branco optic", context: ["trabalho"] },
      { hex: "#E63946", label: "Vermelho puro", context: ["noite"] },
      { hex: "#023E8A", label: "Azul royal", context: ["trabalho"] },
    ],
    lipstick: [
      { hex: "#C1121F", label: "Vermelho clássico" },
      { hex: "#9B2226", label: "Berry intenso" },
    ],
    eyeshadow: [
      { hex: "#240046", label: "Roxo profundo" },
      { hex: "#001D3D", label: "Azul noite" },
    ],
    base: [{ hex: "#E8B4B8", label: "Base rosa fria" }],
  },
  {
    id: "true_winter",
    namePt: "Inverno Verdadeiro",
    nameEn: "True Winter",
    temperature: "cool",
    value: "deep",
    chroma: "bright",
    description:
      "Hemoglobina alta, contraste elevado e paleta fria intensa.",
    useColors: ["#0D1B2A", "#F8F9FA", "#D00000", "#3A0CA3", "#4CC9F0"],
    avoidColors: ["#E9C46A", "#F4A261", "#606C38", "#FEFAE0"],
    clothing: [
      { hex: "#0D1B2A", label: "Preto-azulado", context: ["trabalho"] },
      { hex: "#D00000", label: "Vermelho frio", context: ["noite"] },
      { hex: "#3A0CA3", label: "Roxo real", context: ["noite"] },
    ],
    lipstick: [
      { hex: "#9D0208", label: "Vermelho frio" },
      { hex: "#6A040F", label: "Borgonha" },
    ],
    eyeshadow: [
      { hex: "#3A0CA3", label: "Roxo" },
      { hex: "#0077B6", label: "Azul gelo" },
    ],
    base: [{ hex: "#E5B4B4", label: "Base porcelana fria" }],
  },
  {
    id: "deep_winter",
    namePt: "Inverno Profundo",
    nameEn: "Deep Winter",
    temperature: "cool",
    value: "deep",
    chroma: "muted",
    description:
      "Frio e profundo. Joias escuras, berry e azuis densos.",
    useColors: ["#1A1A2E", "#16213E", "#0F3460", "#533483", "#E94560"],
    avoidColors: ["#FFE5B4", "#F4A261", "#FEFAE0", "#DDB892"],
    clothing: [
      { hex: "#1A1A2E", label: "Preto profundo", context: ["trabalho", "noite"] },
      { hex: "#0F3460", label: "Azul noite", context: ["trabalho"] },
      { hex: "#E94560", label: "Berry", context: ["noite"] },
    ],
    lipstick: [
      { hex: "#6A040F", label: "Vinho" },
      { hex: "#370617", label: "Ameixa escura" },
    ],
    eyeshadow: [
      { hex: "#240046", label: "Roxo escuro" },
      { hex: "#1B263B", label: "Grafite" },
    ],
    base: [{ hex: "#C9A9A6", label: "Base oliva fria" }],
  },
];

/** Objetivos da análise — definidos no upload para personalizar a entrega. */

export const ANALYSIS_GOAL_IDS = [
  "harmonia",
  "roupas",
  "maquiagem",
  "cabelo",
  "olheiras",
  "manchas",
  "vermelhidao",
  "base",
] as const;

export type AnalysisGoalId = (typeof ANALYSIS_GOAL_IDS)[number];

export const ANALYSIS_GOAL_OPTIONS: Array<{
  id: AnalysisGoalId;
  label: string;
  hint: string;
}> = [
  {
    id: "harmonia",
    label: "Harmonia de cores (estação)",
    hint: "Subtom e paleta sazonal — o núcleo da colorimetria",
  },
  {
    id: "roupas",
    label: "Roupas",
    hint: "Cores e peças que combinam com você",
  },
  {
    id: "maquiagem",
    label: "Maquiagem (batom e sombra)",
    hint: "Tons de batom e sombra alinhados à estação",
  },
  {
    id: "cabelo",
    label: "Cabelo e mechas",
    hint: "Direção de cor, brilho, neutralização e harmonia com a cartela",
  },
  {
    id: "olheiras",
    label: "Suavizar olheiras",
    hint: "Cores que iluminam a área dos olhos e deixam o olhar descansado",
  },
  {
    id: "manchas",
    label: "Uniformizar manchas",
    hint: "Sugestões para um tom de pele mais equilibrado e suave",
  },
  {
    id: "vermelhidao",
    label: "Acalmar vermelhidão",
    hint: "Tons que suavizam vermelhidão e deixam a pele mais serena",
  },
  {
    id: "base",
    label: "Base no seu tom",
    hint: "Base e toque de luz alinhados ao seu subtom",
  },
];

/** Default se o cliente não enviar nada válido: colorimetria clássica, sem correção forçada. */
export const DEFAULT_ANALYSIS_GOALS: AnalysisGoalId[] = [
  "harmonia",
  "roupas",
  "maquiagem",
];

const GOAL_SET = new Set<string>(ANALYSIS_GOAL_IDS);

export function parseAnalysisGoals(raw: unknown): AnalysisGoalId[] {
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(",").map((s) => s.trim())
      : [];
  const unique = [
    ...new Set(
      list.filter((g): g is AnalysisGoalId => GOAL_SET.has(String(g))),
    ),
  ];
  return unique.length > 0 ? unique : [...DEFAULT_ANALYSIS_GOALS];
}

export function hasGoal(
  goals: AnalysisGoalId[] | string[],
  goal: AnalysisGoalId,
): boolean {
  return goals.includes(goal);
}

export function wantsSkinCorrection(goals: AnalysisGoalId[] | string[]): boolean {
  return (
    hasGoal(goals, "olheiras") ||
    hasGoal(goals, "manchas") ||
    hasGoal(goals, "vermelhidao") ||
    hasGoal(goals, "base")
  );
}

export function skinConcernsFromGoals(
  goals: AnalysisGoalId[] | string[],
): Array<"olheiras" | "manchas" | "vermelhidao" | "cobertura"> {
  const concerns: Array<"olheiras" | "manchas" | "vermelhidao" | "cobertura"> =
    [];
  if (hasGoal(goals, "olheiras")) concerns.push("olheiras");
  if (hasGoal(goals, "manchas")) concerns.push("manchas");
  if (hasGoal(goals, "vermelhidao")) concerns.push("vermelhidao");
  if (hasGoal(goals, "base")) concerns.push("cobertura");
  return concerns;
}

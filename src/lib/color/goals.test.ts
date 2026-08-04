import { describe, expect, it } from "vitest";
import {
  DEFAULT_ANALYSIS_GOALS,
  parseAnalysisGoals,
  skinConcernsFromGoals,
  wantsSkinCorrection,
} from "@/lib/color/goals";

describe("parseAnalysisGoals", () => {
  it("usa default clássico quando vazio/inválido", () => {
    expect(parseAnalysisGoals([])).toEqual(DEFAULT_ANALYSIS_GOALS);
    expect(parseAnalysisGoals(["x"])).toEqual(DEFAULT_ANALYSIS_GOALS);
  });

  it("aceita só goals válidos e únicos", () => {
    expect(parseAnalysisGoals(["olheiras", "olheiras", "harmonia", "nope"])).toEqual(
      ["olheiras", "harmonia"],
    );
  });
});

describe("skinConcernsFromGoals", () => {
  it("não inclui correção se só harmonia/roupas", () => {
    expect(wantsSkinCorrection(["harmonia", "roupas"])).toBe(false);
    expect(skinConcernsFromGoals(["harmonia", "roupas"])).toEqual([]);
  });

  it("mapeia goals de pele para concerns", () => {
    expect(skinConcernsFromGoals(["olheiras", "base"])).toEqual([
      "olheiras",
      "cobertura",
    ]);
  });
});

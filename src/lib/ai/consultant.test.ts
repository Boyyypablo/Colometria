import { describe, expect, it } from "vitest";
import {
  consultantChangeTarget,
  consultantPlanSchema,
} from "./consultant-plan-schema";
import { parseConsultantPlan, shouldUseVision } from "./consultant";

describe("consultantPlanSchema", () => {
  it("aceita plano válido", () => {
    const plan = {
      assessment: "Intenção de valorizar o olhar com olheiras leves.",
      priorities: [
        {
          trait: "olhar",
          action: "exaltar",
          why: "Pedido explícito + contraste médio.",
          confidence: 0.8,
        },
      ],
      changes: [
        {
          id: "olhar-1",
          area: "sobrancelha",
          suggestion: "Definir sobrancelha no tom do cabelo.",
          colors: ["#3D2B1F"],
          do: "Traço fino e preenchimento suave.",
          dont: "Evitar preto absoluto perto dos olhos.",
        },
      ],
      seasonAlignment: "Alinha com Inverno Brilhante sem endurecer.",
      needsHumanReview: false,
    };
    expect(consultantPlanSchema.parse(plan).changes[0].id).toBe("olhar-1");
  });

  it("parseConsultantPlan rejeita lixo", () => {
    expect(parseConsultantPlan({ foo: 1 })).toBeNull();
  });

  it("consultantChangeTarget", () => {
    expect(consultantChangeTarget("olhar-1")).toBe("ai_change:olhar-1");
  });
});

describe("shouldUseVision", () => {
  it("liga com goals de pele", () => {
    expect(
      shouldUseVision({ intention: "quero cores", goals: ["olheiras"] }),
    ).toBe(true);
  });

  it("liga por palavra na intenção", () => {
    expect(
      shouldUseVision({
        intention: "quero exaltar o olhar e suavizar olheiras",
        goals: ["harmonia"],
      }),
    ).toBe(true);
  });

  it("fica off em intenção só de paleta", () => {
    expect(
      shouldUseVision({
        intention: "quero saber minha cartela de cores para roupas",
        goals: ["harmonia", "roupas"],
      }),
    ).toBe(false);
  });
});

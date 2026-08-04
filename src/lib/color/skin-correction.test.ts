import { describe, expect, it } from "vitest";
import { buildSkinCorrection } from "@/lib/color/skin-correction";

describe("buildSkinCorrection", () => {
  it("quente inclui corretivo pêssego/salmão para olheiras quando pedido", () => {
    const block = buildSkinCorrection({
      temperature: "warm",
      goals: ["olheiras"],
    });
    expect(block).not.toBeNull();
    expect(block!.items.some((i) => i.label.includes("pêssego"))).toBe(true);
    expect(block!.items.every((i) => i.concern === "olheiras")).toBe(true);
  });

  it("retorna null se goals não pedem correção", () => {
    expect(
      buildSkinCorrection({
        temperature: "warm",
        goals: ["harmonia", "roupas"],
      }),
    ).toBeNull();
  });

  it("frio filtra só vermelhidão quando pedido", () => {
    const block = buildSkinCorrection({
      temperature: "cool",
      goals: ["vermelhidao"],
    });
    expect(block!.items.some((i) => i.concern === "vermelhidao")).toBe(true);
  });

  it("inclui foco em sobrancelha/cabelo para suavizar olheiras", () => {
    const block = buildSkinCorrection({
      temperature: "cool",
      goals: ["olheiras"],
    });
    expect(block!.items.some((i) => i.role === "foco_olhar")).toBe(true);
    expect(block!.intro).toMatch(/sobrancelha|cabelo/i);
  });
});

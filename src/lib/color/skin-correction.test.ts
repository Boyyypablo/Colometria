import { describe, expect, it } from "vitest";
import { buildSkinCorrection } from "@/lib/color/skin-correction";

describe("buildSkinCorrection", () => {
  it("quente inclui corretivo pêssego/salmão para olheiras", () => {
    const block = buildSkinCorrection({ temperature: "warm" });
    expect(block.items.some((i) => i.label.includes("pêssego"))).toBe(true);
    expect(block.items.some((i) => i.concern === "olheiras")).toBe(true);
    expect(block.items.every((i) => i.target.startsWith("correction:"))).toBe(
      true,
    );
  });

  it("frio inclui lavanda ou rosa-pêssego", () => {
    const block = buildSkinCorrection({ temperature: "cool" });
    const labels = block.items.map((i) => i.label.toLowerCase()).join(" ");
    expect(labels).toMatch(/lavanda|rosa/);
  });

  it("sempre inclui evitar preto local e corretivo verde", () => {
    for (const temperature of ["warm", "cool"] as const) {
      const block = buildSkinCorrection({ temperature });
      expect(block.items.some((i) => i.role === "evitar_local")).toBe(true);
      expect(block.items.some((i) => i.concern === "vermelhidao")).toBe(true);
    }
  });
});

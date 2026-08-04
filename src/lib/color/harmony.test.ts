import { describe, expect, it } from "vitest";
import { deltaE76, hexToLab } from "@/lib/color/cielab";
import {
  rankHexColors,
  scoreColorAgainstSkin,
} from "@/lib/color/harmony";

describe("harmony ranking", () => {
  const warmSkin = { L: 62, a: 14, b: 22 };

  it("deltaE76 zero para mesma cor", () => {
    expect(deltaE76(warmSkin, warmSkin)).toBe(0);
  });

  it("prefere tom quente alinhado ao subtom quente", () => {
    const peach = scoreColorAgainstSkin(warmSkin, "#E07A5F", {
      temperature: "warm",
      chroma: "soft",
    });
    const icy = scoreColorAgainstSkin(warmSkin, "#3D5A80", {
      temperature: "warm",
      chroma: "soft",
    });
    expect(peach.score).toBeGreaterThan(icy.score);
  });

  it("rankHexColors ordena do melhor ao pior", () => {
    const ranked = rankHexColors(
      ["#4A6FA5", "#E07A5F", "#2A9D8F"],
      {
        skinLab: warmSkin,
        temperature: "warm",
        value: "medium",
        chroma: "soft",
      },
      3,
    );
    expect(ranked[0]!.score).toBeGreaterThanOrEqual(ranked[1]!.score);
    expect(ranked[0]!.why.length).toBeGreaterThan(10);
  });

  it("hexToLab parseia", () => {
    const lab = hexToLab("#FFFFFF");
    expect(lab.L).toBeGreaterThan(95);
  });
});

import { describe, expect, it } from "vitest";
import {
  buildKontextPrompt,
  describeColor,
  hexToRgb,
} from "@/lib/vto/color-edit";
import { detectSimulationScene } from "@/lib/vto/scene";

describe("color-edit helpers", () => {
  it("hexToRgb parseia", () => {
    expect(hexToRgb("#F4A261")).toEqual({ r: 244, g: 162, b: 97 });
  });

  it("describeColor nomeia peach/teal", () => {
    expect(describeColor("#F4A261")).toMatch(/peach|orange/i);
    expect(describeColor("#2A9D8F")).toMatch(/teal|aqua|green/i);
  });

  it("prompt com roupa: recolor imperativo", () => {
    const p = buildKontextPrompt("#F4A261", "BLOUSE_TONE", "garment_visible");
    expect(p.toLowerCase()).toContain("change");
    expect(p).toContain("#F4A261");
    expect(p.toLowerCase()).toMatch(/peach|orange/);
  });

  it("prompt close-up: pede corpo + blusa", () => {
    const p = buildKontextPrompt("#F4A261", "BLOUSE_TONE", "face_closeup");
    expect(p.toLowerCase()).toMatch(/close-up|upper-body|shoulders/);
    expect(p.toLowerCase()).toMatch(/blouse|shirt/);
    expect(p).toContain("#F4A261");
  });
});

describe("detectSimulationScene", () => {
  it("rosto grande / pouco espaço abaixo → face_closeup", () => {
    expect(
      detectSimulationScene({ x: 0.2, y: 0.1, width: 0.55, height: 0.6 }),
    ).toBe("face_closeup");
    expect(
      detectSimulationScene({ x: 0.25, y: 0.15, width: 0.45, height: 0.7 }),
    ).toBe("face_closeup");
  });

  it("rosto menor com tronco abaixo → garment_visible", () => {
    expect(
      detectSimulationScene({ x: 0.3, y: 0.08, width: 0.35, height: 0.32 }),
    ).toBe("garment_visible");
  });

  it("sem faceBox assume garment_visible", () => {
    expect(detectSimulationScene(null)).toBe("garment_visible");
    expect(detectSimulationScene(undefined)).toBe("garment_visible");
  });
});

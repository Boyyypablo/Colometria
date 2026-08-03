import { describe, expect, it } from "vitest";
import { roisFromFaceBox, analysisCropFromFace } from "@/lib/vision/face/rois";
import { HeuristicFaceDetector } from "@/lib/vision/face/providers/heuristic";
import sharp from "sharp";

describe("roisFromFaceBox", () => {
  it("gera 4 ROIs dentro do bbox", () => {
    const box = { x: 0.2, y: 0.1, width: 0.5, height: 0.6, score: 0.9 };
    const rois = roisFromFaceBox(box);
    expect(rois.map((r) => r.kind).sort()).toEqual(
      ["forehead", "jaw", "leftCheek", "rightCheek"].sort(),
    );
    for (const r of rois) {
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(1.001);
      expect(r.y + r.height).toBeLessThanOrEqual(1.001);
    }
  });

  it("analysisCropFromFace adiciona margem sem sair de 0–1", () => {
    const crop = analysisCropFromFace({
      x: 0.3,
      y: 0.2,
      width: 0.4,
      height: 0.5,
      score: 1,
    });
    expect(crop.x).toBeLessThan(0.3);
    expect(crop.y).toBeLessThan(0.2);
    expect(crop.x + crop.width).toBeLessThanOrEqual(1.001);
  });
});

describe("HeuristicFaceDetector", () => {
  it("encontra janela de pele em imagem sintética", async () => {
    // Fundo azul + bloco pele no centro
    const w = 200;
    const h = 240;
    const raw = Buffer.alloc(w * h * 3);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 3;
        const inFace = x > 60 && x < 140 && y > 40 && y < 180;
        if (inFace) {
          raw[i] = 210;
          raw[i + 1] = 160;
          raw[i + 2] = 120;
        } else {
          raw[i] = 30;
          raw[i + 1] = 60;
          raw[i + 2] = 180;
        }
      }
    }
    const buffer = await sharp(raw, { raw: { width: w, height: h, channels: 3 } })
      .jpeg()
      .toBuffer();

    const det = new HeuristicFaceDetector();
    const result = await det.detect(buffer, w, h);
    expect(result.provider).toBe("heuristic");
    expect(result.primary).not.toBeNull();
    expect(result.rois.length).toBe(4);
    // Centro do crop deve ficar perto do centro da face sintética
    const cx = result.primary!.x + result.primary!.width / 2;
    expect(cx).toBeGreaterThan(0.25);
    expect(cx).toBeLessThan(0.75);
  });
});

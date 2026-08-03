import sharp from "sharp";
import { analysisCropFromFace, roisFromFaceBox } from "../rois";
import type { FaceBox, FaceDetectionResult, FaceDetector } from "../types";

/** Heurística YCbCr — compartilhada com o classificador. */
export function isSkinPixel(r: number, g: number, b: number): boolean {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return (
    y > 40 &&
    y < 240 &&
    cb >= 77 &&
    cb <= 127 &&
    cr >= 133 &&
    cr <= 173 &&
    r > 60 &&
    g > 30 &&
    b > 15 &&
    r > g &&
    r > b
  );
}

/**
 * Provider default sem deps extras: varre janelas e escolhe a de maior densidade de pele.
 * Sempre disponível — fallback oficial quando BlazeFace/YuNet falharem.
 */
export class HeuristicFaceDetector implements FaceDetector {
  readonly id = "heuristic";

  async detect(
    buffer: Buffer,
    width: number,
    height: number,
  ): Promise<FaceDetectionResult> {
    const warnings: string[] = [];
    const scanSize = 160;
    const { data, info } = await sharp(buffer)
      .rotate()
      .ensureAlpha()
      .resize({ width: scanSize, height: scanSize, fit: "inside" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const sw = info.width;
    const sh = info.height;
    const channels = info.channels;
    const winW = Math.max(24, Math.floor(sw * 0.45));
    const winH = Math.max(28, Math.floor(sh * 0.55));
    const step = Math.max(6, Math.floor(winW / 4));

    let best: { score: number; x: number; y: number; w: number; h: number } | null =
      null;

    for (let y = 0; y <= sh - winH; y += step) {
      for (let x = 0; x <= sw - winW; x += step) {
        let skin = 0;
        let total = 0;
        for (let py = y; py < y + winH; py += 2) {
          for (let px = x; px < x + winW; px += 2) {
            const i = (py * sw + px) * channels;
            const r = data[i]!;
            const g = data[i + 1]!;
            const b = data[i + 2]!;
            total += 1;
            if (isSkinPixel(r, g, b)) skin += 1;
          }
        }
        const density = skin / Math.max(1, total);
        // Prefere janelas um pouco acima do centro vertical (selfies)
        const centerBias =
          1 - Math.abs(y + winH / 2 - sh * 0.42) / sh - Math.abs(x + winW / 2 - sw / 2) / sw;
        const score = density * 0.85 + Math.max(0, centerBias) * 0.15;
        if (!best || score > best.score) {
          best = { score, x, y, w: winW, h: winH };
        }
      }
    }

    if (!best || best.score < 0.04) {
      warnings.push(
        "Detector heurístico: pouca pele encontrada — usando recorte central clássico.",
      );
      const fallback: FaceBox = {
        x: 0.25,
        y: 0.12,
        width: 0.5,
        height: 0.55,
        score: best?.score ?? 0,
      };
      return {
        provider: this.id,
        faces: [],
        primary: fallback,
        rois: roisFromFaceBox(fallback),
        warnings,
        usedFallback: true,
      };
    }

    const primary: FaceBox = {
      x: best.x / sw,
      y: best.y / sh,
      width: best.w / sw,
      height: best.h / sh,
      score: Number(best.score.toFixed(4)),
    };

    // Garante coords relativas à imagem original (resize fit:inside mantém proporção)
    void width;
    void height;

    const crop = analysisCropFromFace(primary);
    return {
      provider: this.id,
      faces: [primary],
      primary: crop,
      rois: roisFromFaceBox(crop),
      warnings,
      usedFallback: false,
    };
  }
}

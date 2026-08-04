import sharp from "sharp";
import type { VtoFaceBox } from "./types";
import { hexToRgb } from "./color-edit";

/**
 * Fallback para close-up: amplia o canvas, posiciona o rosto e desenha ombros/tronco na cor alvo.
 */
export async function composeFaceOntoColoredBody(
  image: Buffer,
  hex: string,
  faceBox?: VtoFaceBox,
): Promise<Buffer> {
  const { r, g, b } = hexToRgb(hex);
  const src = sharp(image).rotate();
  const meta = await src.metadata();
  const srcW = meta.width ?? 800;
  const srcH = meta.height ?? 1000;

  // Canvas vertical tipo retrato meio corpo
  const outW = Math.max(768, Math.round(srcW * 0.95));
  const outH = Math.round(outW * 1.35);

  const bg = await sharp({
    create: {
      width: outW,
      height: outH,
      channels: 3,
      background: { r: 245, g: 240, b: 234 },
    },
  })
    .jpeg()
    .toBuffer();

  // Recorte do rosto (com margem)
  let cropLeft = 0;
  let cropTop = 0;
  let cropW = srcW;
  let cropH = Math.round(srcH * 0.72);
  if (faceBox) {
    const padX = faceBox.width * 0.35;
    const padY = faceBox.height * 0.45;
    cropLeft = Math.max(0, Math.floor((faceBox.x - padX) * srcW));
    cropTop = Math.max(0, Math.floor((faceBox.y - padY) * srcH));
    const right = Math.min(srcW, Math.ceil((faceBox.x + faceBox.width + padX) * srcW));
    const bottom = Math.min(
      srcH,
      Math.ceil((faceBox.y + faceBox.height + padY * 0.35) * srcH),
    );
    cropW = Math.max(32, right - cropLeft);
    cropH = Math.max(32, bottom - cropTop);
  } else {
    cropH = Math.round(srcH * 0.65);
  }

  const faceH = Math.round(outH * 0.48);
  let faceW = Math.round((cropW / cropH) * faceH);
  faceW = Math.min(faceW, Math.round(outW * 0.92));
  const faceLeft = Math.round((outW - faceW) / 2);
  const faceTop = Math.round(outH * 0.06);

  const faceBuf = await sharp(image)
    .rotate()
    .extract({
      left: cropLeft,
      top: cropTop,
      width: Math.min(cropW, srcW - cropLeft),
      height: Math.min(cropH, srcH - cropTop),
    })
    .resize(faceW, faceH, { fit: "cover" })
    .jpeg()
    .toBuffer();

  // Ombros / tronco: trapézio arredondado via SVG
  const torsoTop = faceTop + Math.round(faceH * 0.78);
  const torsoH = outH - torsoTop;
  const neckW = Math.round(faceW * 0.28);
  const shoulderW = Math.round(outW * 0.92);
  const cx = outW / 2;
  const svg = `
<svg width="${outW}" height="${outH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgb(${r},${g},${b})" stop-opacity="1"/>
      <stop offset="100%" stop-color="rgb(${Math.max(0, r - 28)},${Math.max(0, g - 28)},${Math.max(0, b - 22)})" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <path d="
    M ${cx - neckW} ${torsoTop}
    C ${cx - neckW * 1.8} ${torsoTop + torsoH * 0.08}, ${cx - shoulderW / 2} ${torsoTop + torsoH * 0.18}, ${cx - shoulderW / 2} ${torsoTop + torsoH * 0.28}
    L ${cx - shoulderW / 2} ${outH}
    L ${cx + shoulderW / 2} ${outH}
    L ${cx + shoulderW / 2} ${torsoTop + torsoH * 0.28}
    C ${cx + shoulderW / 2} ${torsoTop + torsoH * 0.18}, ${cx + neckW * 1.8} ${torsoTop + torsoH * 0.08}, ${cx + neckW} ${torsoTop}
    Z
  " fill="url(#g)"/>
</svg>`;

  const torsoPng = await sharp(Buffer.from(svg)).png().toBuffer();

  return sharp(bg)
    .composite([
      { input: torsoPng, top: 0, left: 0 },
      { input: faceBuf, top: faceTop, left: faceLeft },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
}

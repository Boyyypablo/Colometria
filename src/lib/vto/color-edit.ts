import sharp from "sharp";
import type { SimulationType } from "@prisma/client";
import type { VtoFaceBox } from "./types";
import type { SimulationScene } from "./scene";

export function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const num = Number.parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/** Nome aproximado para prompts (Kontext responde melhor a linguagem imperativa + cor nomeada). */
export function describeColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const l = (max + min) / 2 / 255;
  if (sat < 0.15) {
    if (l > 0.75) return "off-white cream";
    if (l < 0.25) return "near-black charcoal";
    return "neutral gray";
  }
  // hue aproximado
  let h = 0;
  const d = max - min || 1;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  if (h < 20 || h >= 340) return l > 0.55 ? "light coral pink" : "deep red";
  if (h < 45) return l > 0.55 ? "peach orange" : "burnt orange";
  if (h < 70) return l > 0.55 ? "soft yellow" : "mustard yellow";
  if (h < 160) return l > 0.55 ? "mint green" : "forest green";
  if (h < 200) return "teal aqua";
  if (h < 260) return l > 0.55 ? "sky blue" : "navy blue";
  if (h < 310) return "violet purple";
  return "magenta pink";
}

export function buildKontextPrompt(
  hex: string,
  type: SimulationType,
  scene: SimulationScene = "garment_visible",
): string {
  const color = hex.toUpperCase().startsWith("#") ? hex.toUpperCase() : `#${hex}`;
  const name = describeColor(color);

  if (type === "COLOR_DRAPE") {
    return [
      `Edit this photo: drape a large solid ${name} (${color}) fabric cloth under the person's chin and over the upper chest.`,
      `The fabric color must be clearly ${name}, saturated and obvious.`,
      `Keep the person's face, hair, skin tone, and identity exactly the same.`,
      `Photorealistic fabric with natural folds. No text or logos.`,
    ].join(" ");
  }

  if (scene === "face_closeup") {
    return [
      `Transform this face close-up into a photorealistic upper-body portrait of the SAME person.`,
      `Show shoulders and upper torso wearing a solid ${name} (${color}) blouse or shirt.`,
      `The clothing must be clearly ${name} — saturated and filling the torso.`,
      `Keep the exact same face, hair, skin tone, expression and identity.`,
      `Natural proportions, soft studio lighting, no text, no logos, no extra people.`,
    ].join(" ");
  }

  return [
    `Edit this photo: change ONLY the person's visible shirt, blouse or top to a solid ${name} (${color}).`,
    `The garment must become obviously ${name}, not navy and not black.`,
    `Keep face, hair, skin, expression and identity exactly the same.`,
    `Preserve fabric wrinkles and shadows. Do not change the background. No text.`,
  ].join(" ");
}

/** Amostra a região do torso/drape e mede distância média ao RGB alvo. */
export async function torsoColorDistance(
  image: Buffer,
  hex: string,
  type: SimulationType,
  faceBox?: VtoFaceBox,
): Promise<number> {
  const { r, g, b } = hexToRgb(hex);
  const meta = await sharp(image).metadata();
  const width = meta.width ?? 800;
  const height = meta.height ?? 1000;

  let left = Math.floor(width * 0.25);
  let top = Math.floor(height * 0.45);
  let w = Math.floor(width * 0.5);
  let h = Math.floor(height * 0.4);

  if (faceBox) {
    if (type === "COLOR_DRAPE") {
      top = Math.floor((faceBox.y + faceBox.height * 0.72) * height);
      h = Math.max(32, Math.floor(faceBox.height * 0.4 * height));
      left = Math.floor(faceBox.x * width);
      w = Math.max(32, Math.floor(faceBox.width * width));
    } else {
      top = Math.floor((faceBox.y + faceBox.height * 0.85) * height);
      h = Math.max(48, height - top);
      left = Math.floor(Math.max(0, faceBox.x - faceBox.width * 0.1) * width);
      w = Math.min(width - left, Math.floor(faceBox.width * 1.2 * width));
    }
  }

  top = Math.min(Math.max(0, top), height - 1);
  h = Math.min(h, height - top);
  left = Math.min(Math.max(0, left), width - 1);
  w = Math.min(w, width - left);

  const { data, info } = await sharp(image)
    .extract({ left, top, width: w, height: h })
    .resize(48, 48, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let sr = 0;
  let sg = 0;
  let sb = 0;
  const n = info.width * info.height;
  for (let i = 0; i < data.length; i += 3) {
    sr += data[i];
    sg += data[i + 1];
    sb += data[i + 2];
  }
  const mr = sr / n;
  const mg = sg / n;
  const mb = sb / n;
  return Math.sqrt((mr - r) ** 2 + (mg - g) ** 2 + (mb - b) ** 2);
}

/**
 * Overlay Sharp na imagem (garante mudança visível se a IA falhar em mudar a cor).
 */
export async function applyVisibleColorOverlay(
  image: Buffer,
  hex: string,
  type: SimulationType,
  faceBox?: VtoFaceBox,
): Promise<Buffer> {
  const { r, g, b } = hexToRgb(hex);
  const base = sharp(image).rotate();
  const meta = await base.metadata();
  const width = meta.width ?? 800;
  const height = meta.height ?? 1000;

  let overlayTop: number;
  let overlayHeight: number;
  let overlayLeft = 0;
  let overlayWidth = width;

  if (type === "COLOR_DRAPE" && faceBox) {
    overlayTop = Math.floor((faceBox.y + faceBox.height * 0.72) * height);
    overlayHeight = Math.max(24, Math.floor(faceBox.height * 0.35 * height));
    overlayLeft = Math.floor(faceBox.x * width);
    overlayWidth = Math.max(24, Math.floor(faceBox.width * width));
  } else if (type === "COLOR_DRAPE") {
    overlayTop = Math.floor(height * 0.55);
    overlayHeight = height - overlayTop;
  } else if (faceBox) {
    overlayTop = Math.floor((faceBox.y + faceBox.height * 0.85) * height);
    overlayHeight = Math.max(40, height - overlayTop);
    overlayLeft = Math.floor(
      Math.max(0, faceBox.x - faceBox.width * 0.15) * width,
    );
    overlayWidth = Math.min(
      width - overlayLeft,
      Math.floor(faceBox.width * 1.3 * width),
    );
  } else {
    overlayTop = Math.floor(height * 0.45);
    overlayHeight = height - overlayTop;
  }

  overlayTop = Math.min(Math.max(0, overlayTop), height - 1);
  overlayHeight = Math.min(overlayHeight, height - overlayTop);
  overlayLeft = Math.min(Math.max(0, overlayLeft), width - 1);
  overlayWidth = Math.min(overlayWidth, width - overlayLeft);

  const overlay = await sharp({
    create: {
      width: overlayWidth,
      height: overlayHeight,
      channels: 4,
      background: { r, g, b, alpha: type === "COLOR_DRAPE" ? 0.78 : 0.65 },
    },
  })
    .png()
    .toBuffer();

  return base
    .composite([{ input: overlay, top: overlayTop, left: overlayLeft }])
    .jpeg({ quality: 90 })
    .toBuffer();
}

/** Distância alta = cor alvo ainda não aparece na região. */
export const COLOR_MATCH_THRESHOLD = 95;

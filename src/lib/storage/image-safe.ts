import sharp from "sharp";

const ALLOWED = new Set(["jpeg", "png", "webp"]);

export type SafeImageResult = {
  buffer: Buffer;
  extension: "jpg" | "png" | "webp";
  mime: string;
};

/**
 * Valida magic bytes via sharp e re-encode (só jpeg/png/webp).
 */
export async function sanitizeUploadImage(
  input: Buffer,
): Promise<SafeImageResult> {
  const meta = await sharp(input, { failOn: "error" }).rotate().metadata();
  const format = meta.format;
  if (!format || !ALLOWED.has(format)) {
    throw new Error("Formato de imagem não suportado. Use JPEG, PNG ou WebP.");
  }
  if (!meta.width || !meta.height || meta.width > 8000 || meta.height > 8000) {
    throw new Error("Dimensões de imagem inválidas.");
  }

  if (format === "png") {
    const buffer = await sharp(input).rotate().png({ compressionLevel: 8 }).toBuffer();
    return { buffer, extension: "png", mime: "image/png" };
  }
  if (format === "webp") {
    const buffer = await sharp(input).rotate().webp({ quality: 90 }).toBuffer();
    return { buffer, extension: "webp", mime: "image/webp" };
  }
  const buffer = await sharp(input).rotate().jpeg({ quality: 90 }).toBuffer();
  return { buffer, extension: "jpg", mime: "image/jpeg" };
}

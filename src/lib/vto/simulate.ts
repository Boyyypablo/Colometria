import sharp from "sharp";
import { saveUserImage, readUpload } from "@/lib/storage/local";
import { prisma } from "@/lib/db/prisma";
import type { SimulationType } from "@prisma/client";

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const num = Number.parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/** Mock local: drape sob o queixo (usa faceBox se existir) ou overlay no torso. */
async function runMockSimulation(
  inputRelative: string,
  userId: string,
  hex: string,
  type: SimulationType,
  faceBox?: { x: number; y: number; width: number; height: number } | null,
): Promise<string> {
  const input = await readUpload(inputRelative);
  const { r, g, b } = hexToRgb(hex);
  const base = sharp(input).rotate();
  const meta = await base.metadata();
  const width = meta.width ?? 800;
  const height = meta.height ?? 1000;

  let overlayTop: number;
  let overlayHeight: number;
  let overlayLeft = 0;
  let overlayWidth = width;

  if (type === "COLOR_DRAPE" && faceBox) {
    // Faixa sob o queixo do bbox detectado
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
    overlayLeft = Math.floor(Math.max(0, faceBox.x - faceBox.width * 0.15) * width);
    overlayWidth = Math.min(
      width - overlayLeft,
      Math.floor(faceBox.width * 1.3 * width),
    );
  } else {
    overlayTop = Math.floor(height * 0.45);
    overlayHeight = height - overlayTop;
  }

  // Clamp
  overlayTop = Math.min(Math.max(0, overlayTop), height - 1);
  overlayHeight = Math.min(overlayHeight, height - overlayTop);
  overlayLeft = Math.min(Math.max(0, overlayLeft), width - 1);
  overlayWidth = Math.min(overlayWidth, width - overlayLeft);

  const overlay = await sharp({
    create: {
      width: overlayWidth,
      height: overlayHeight,
      channels: 4,
      background: { r, g, b, alpha: type === "COLOR_DRAPE" ? 0.72 : 0.55 },
    },
  })
    .png()
    .toBuffer();

  const composed = await base
    .composite([{ input: overlay, top: overlayTop, left: overlayLeft }])
    .jpeg({ quality: 88 })
    .toBuffer();

  return saveUserImage(userId, composed, "jpg");
}

async function runFalSimulation(
  inputRelative: string,
  userId: string,
  hex: string,
  type: SimulationType,
): Promise<string> {
  const key = process.env.FAL_KEY;
  if (!key) {
    return runMockSimulation(inputRelative, userId, hex, type);
  }

  // Integração mínima fal.ai — fallback para mock se falhar
  try {
    const inputBuffer = await readUpload(inputRelative);
    const base64 = inputBuffer.toString("base64");
    const prompt =
      type === "COLOR_DRAPE"
        ? `Place a smooth fabric drape of solid color ${hex} under the person's chin, photorealistic, keep face unchanged`
        : `Change the person's blouse/top clothing color to solid ${hex}, photorealistic, keep face and background unchanged`;

    const res = await fetch("https://fal.run/fal-ai/flux/dev/image-to-image", {
      method: "POST",
      headers: {
        Authorization: `Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: `data:image/jpeg;base64,${base64}`,
        prompt,
        strength: 0.55,
        num_images: 1,
      }),
    });

    if (!res.ok) {
      throw new Error(`fal.ai ${res.status}`);
    }

    const json = (await res.json()) as {
      images?: Array<{ url: string }>;
    };
    const url = json.images?.[0]?.url;
    if (!url) throw new Error("Sem imagem retornada");

    const imgRes = await fetch(url);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    return saveUserImage(userId, buf, "jpg");
  } catch {
    return runMockSimulation(inputRelative, userId, hex, type);
  }
}

export async function processSimulationJob(jobId: string): Promise<void> {
  const job = await prisma.simulationJob.findUnique({
    where: { id: jobId },
    include: { analysis: { select: { features: true } } },
  });
  if (!job) return;

  await prisma.simulationJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING" },
  });

  const features = job.analysis.features as {
    faceBox?: { x: number; y: number; width: number; height: number } | null;
  } | null;
  const faceBox = features?.faceBox ?? null;

  try {
    const provider = process.env.VTO_PROVIDER || "mock";
    const outputPath =
      provider === "fal"
        ? await runFalSimulation(
            job.inputPath,
            job.userId,
            job.targetColorHex,
            job.type,
          )
        : await runMockSimulation(
            job.inputPath,
            job.userId,
            job.targetColorHex,
            job.type,
            faceBox,
          );

    await prisma.simulationJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        outputPath,
        provider,
      },
    });
  } catch (err) {
    await prisma.simulationJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: err instanceof Error ? err.message : "Erro desconhecido",
      },
    });
  }
}

export async function countTodaySimulations(userId: string): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return prisma.simulationJob.count({
    where: {
      userId,
      createdAt: { gte: start },
    },
  });
}

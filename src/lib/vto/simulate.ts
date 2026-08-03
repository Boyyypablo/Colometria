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

/** Mock local: aplica faixa de cor sob o terço inferior (drape) ou overlay na região do torso. */
async function runMockSimulation(
  inputRelative: string,
  userId: string,
  hex: string,
  type: SimulationType,
): Promise<string> {
  const input = await readUpload(inputRelative);
  const { r, g, b } = hexToRgb(hex);
  const base = sharp(input).rotate();
  const meta = await base.metadata();
  const width = meta.width ?? 800;
  const height = meta.height ?? 1000;

  const overlayTop =
    type === "COLOR_DRAPE"
      ? Math.floor(height * 0.55)
      : Math.floor(height * 0.45);
  const overlayHeight = height - overlayTop;

  const overlay = await sharp({
    create: {
      width,
      height: overlayHeight,
      channels: 4,
      background: { r, g, b, alpha: type === "COLOR_DRAPE" ? 0.72 : 0.55 },
    },
  })
    .png()
    .toBuffer();

  const composed = await base
    .composite([{ input: overlay, top: overlayTop, left: 0 }])
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
  const job = await prisma.simulationJob.findUnique({ where: { id: jobId } });
  if (!job) return;

  await prisma.simulationJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING" },
  });

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

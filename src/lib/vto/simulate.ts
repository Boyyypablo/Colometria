import { prisma } from "@/lib/db/prisma";
import { falVtoProvider } from "./providers/fal";
import { geminiVtoProvider } from "./providers/gemini";
import { huggingfaceVtoProvider } from "./providers/huggingface";
import { mockVtoProvider } from "./providers/mock";
import {
  isFalConfigured,
  isGeminiConfigured,
  isHuggingFaceConfigured,
  isVtoAiReady,
  resolveVtoProviderId,
  type VtoProvider,
} from "./types";

function getProvider(): VtoProvider {
  const id = resolveVtoProviderId();
  if (id === "mock") return mockVtoProvider;
  if (id === "fal") return falVtoProvider;
  if (id === "gemini") return geminiVtoProvider;
  return huggingfaceVtoProvider;
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
  const provider = getProvider();
  const allowMockFallback =
    process.env.VTO_ALLOW_MOCK_FALLBACK === "true" && provider.id !== "mock";

  try {
    let result;
    try {
      result = await provider.run({
        inputRelative: job.inputPath,
        userId: job.userId,
        hex: job.targetColorHex,
        type: job.type,
        faceBox,
      });
    } catch (err) {
      if (!allowMockFallback) throw err;
      result = await mockVtoProvider.run({
        inputRelative: job.inputPath,
        userId: job.userId,
        hex: job.targetColorHex,
        type: job.type,
        faceBox,
      });
      await prisma.simulationJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          outputPath: result.outputPath,
          provider: "mock",
          errorMessage: `Simulação indisponível — mock usado. ${
            err instanceof Error ? err.message : String(err)
          }`,
        },
      });
      return;
    }

    await prisma.simulationJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        outputPath: result.outputPath,
        provider: provider.id,
        providerJobId: result.providerJobId,
        errorMessage: null,
      },
    });
  } catch (err) {
    console.error("[vto]", err);
    await prisma.simulationJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: err instanceof Error ? err.message : "Erro desconhecido",
        provider: provider.id,
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

export function getVtoRuntimeInfo() {
  const provider = resolveVtoProviderId();
  const model =
    provider === "huggingface"
      ? process.env.HF_VTO_MODEL || "black-forest-labs/FLUX.1-Kontext-dev"
      : provider === "gemini"
        ? process.env.GEMINI_VTO_MODEL || "gemini-2.5-flash-image"
        : provider === "fal"
          ? process.env.FAL_VTO_MODEL || "fal-ai/flux/dev/image-to-image"
          : "sharp-overlay";

  return {
    provider,
    falConfigured: isFalConfigured(),
    geminiConfigured: isGeminiConfigured(),
    huggingfaceConfigured: isHuggingFaceConfigured(),
    aiReady: isVtoAiReady(provider),
    model,
  };
}

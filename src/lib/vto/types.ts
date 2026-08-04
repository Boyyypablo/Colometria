import type { SimulationType } from "@prisma/client";

export type VtoFaceBox = {
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

export type VtoRunInput = {
  inputRelative: string;
  userId: string;
  hex: string;
  type: SimulationType;
  faceBox?: VtoFaceBox;
};

export type VtoProviderId = "mock" | "fal" | "gemini" | "huggingface";

export interface VtoProvider {
  id: VtoProviderId;
  run(input: VtoRunInput): Promise<{
    outputPath: string;
    providerJobId?: string;
  }>;
}

function cleanEnv(value?: string | null): string {
  return (value || "").trim().replace(/^["']|["']$/g, "");
}

export function resolveVtoProviderId(): VtoProviderId {
  const raw = cleanEnv(process.env.VTO_PROVIDER).toLowerCase() || "huggingface";
  if (raw === "mock") return "mock";
  if (raw === "fal") return "fal";
  if (raw === "gemini") return "gemini";
  if (raw === "hf" || raw === "huggingface" || raw === "hugging-face") {
    return "huggingface";
  }
  return "huggingface";
}

export function isFalConfigured(): boolean {
  const key = cleanEnv(process.env.FAL_KEY);
  return Boolean(key && key.includes(":"));
}

/** Aceita GEMINI_API_KEY ou GOOGLE_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY. */
export function getGeminiApiKey(): string {
  return (
    cleanEnv(process.env.GEMINI_API_KEY) ||
    cleanEnv(process.env.GOOGLE_GENERATIVE_AI_API_KEY) ||
    cleanEnv(process.env.GOOGLE_API_KEY)
  );
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey().length > 10;
}

export function getHuggingFaceToken(): string {
  return (
    cleanEnv(process.env.HF_TOKEN) ||
    cleanEnv(process.env.HUGGINGFACE_HUB_TOKEN) ||
    cleanEnv(process.env.HUGGINGFACE_API_KEY)
  );
}

export function isHuggingFaceConfigured(): boolean {
  const t = getHuggingFaceToken();
  return t.startsWith("hf_") && t.length > 20;
}

export function isVtoAiReady(provider = resolveVtoProviderId()): boolean {
  if (provider === "mock") return true;
  if (provider === "fal") return isFalConfigured();
  if (provider === "gemini") return isGeminiConfigured();
  return isHuggingFaceConfigured();
}

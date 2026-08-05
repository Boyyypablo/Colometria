import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { AnalysisGoalId } from "@/lib/color/goals";
import { wantsSkinCorrection } from "@/lib/color/goals";
import type { ColorFeatures } from "@/lib/color/types";
import { getGeminiApiKey, isGeminiConfigured } from "@/lib/vto/types";
import {
  consultantPlanSchema,
  type ConsultantPlan,
  type ConsultantPlanMeta,
} from "./consultant-plan-schema";

const VISION_INTENT =
  /olheira|mancha|vermelh|tra[cç]o|sobrancelha|l[aá]bio|nariz|olho|olhar|cabelo|pele|exaltar|valorizar|suavizar|assimetr|espinha|poro|base|batom|sombra|maquiagem|rosto/i;

export function isConsultantAiConfigured(): boolean {
  return Boolean(
    isGeminiConfigured() ||
      process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim(),
  );
}

export function shouldUseVision(opts: {
  intention: string;
  goals: AnalysisGoalId[] | string[];
}): boolean {
  if (wantsSkinCorrection(opts.goals)) return true;
  if (
    opts.goals.includes("maquiagem") ||
    opts.goals.includes("cabelo")
  ) {
    return true;
  }
  return VISION_INTENT.test(opts.intention);
}

function resolveModel() {
  const modelId =
    process.env.CONSULTANT_AI_MODEL?.trim() || "gemini-2.5-flash";

  // AI Gateway (Vercel): model string "provider/model"
  if (
    process.env.AI_GATEWAY_API_KEY?.trim() ||
    (process.env.VERCEL && !isGeminiConfigured())
  ) {
    const gatewayModel = modelId.includes("/")
      ? modelId
      : `google/${modelId}`;
    return { model: gatewayModel, label: gatewayModel };
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY (ou GEMINI_API_KEY) não configurada.",
    );
  }
  const google = createGoogleGenerativeAI({ apiKey });
  const id = modelId.includes("/") ? modelId.split("/").pop()! : modelId;
  return { model: google(id), label: id };
}

function factsBlock(input: {
  intention: string;
  goals: string[];
  context: string;
  seasonId: string;
  seasonName: string;
  undertoneLabel: string;
  confidence: number;
  features: ColorFeatures;
  photoQuality: Record<string, unknown>;
}): string {
  const f = input.features;
  return [
    `Intenção da pessoa: ${input.intention}`,
    `Objetivos marcados: ${input.goals.join(", ") || "nenhum"}`,
    `Contexto: ${input.context}`,
    `Estação medida (motor Lab — NÃO invente outra): ${input.seasonName} (${input.seasonId})`,
    `Subtom: ${input.undertoneLabel}`,
    `Confiança do motor: ${input.confidence.toFixed(2)}`,
    `Scores: temp=${f.temperatureScore.toFixed(1)}, value L*=${f.valueScore.toFixed(1)}, chroma=${f.chromaScore.toFixed(1)}, contraste=${f.contrastScore.toFixed(1)} (${f.contrastSource ?? "n/a"})`,
    `Lab undertone: L=${f.labUndertone.L.toFixed(1)} a=${f.labUndertone.a.toFixed(1)} b=${f.labUndertone.b.toFixed(1)}`,
    `Qualidade foto: ${JSON.stringify({
      band: input.photoQuality.qualityBand,
      faceDetected: input.photoQuality.faceDetected,
      warnings: input.photoQuality.warnings,
    })}`,
  ].join("\n");
}

const SYSTEM = `Você é consultora de colorimetria pessoal da Colorimetria.
Recebe a INTENÇÃO da pessoa e fatos objetivos (Lab/estação) do motor.
Sua tarefa: decidir de forma flexível o que suavizar, exaltar ou manter, e sugerir mudanças práticas e novas (não um checklist fixo).

Regras:
1. Respeite a intenção: ela manda na prioridade.
2. A estação/Lab vêm do motor — alinhe o plano a elas; não troque a estação.
3. Seja específica: cores em hex #RRGGBB quando fizer sentido; evite frases genéricas.
4. Não faça diagnóstico médico/dermatológico.
5. needsHumanReview=true se foto ruim, confiança baixa, intenção ambígua ou conflito forte com a medição.
6. Cada change.id deve ser único, curto, slug (ex: olhar-1, sobrancelha-1).
7. Responda em português do Brasil.`;

export type GenerateConsultantPlanInput = {
  intention: string;
  goals: AnalysisGoalId[] | string[];
  context: string;
  seasonId: string;
  seasonName: string;
  undertoneLabel: string;
  confidence: number;
  features: ColorFeatures;
  photoQuality: Record<string, unknown>;
  /** Buffer da foto — só enviado no modo visão (híbrido). */
  imageBuffer?: Buffer;
  imageMediaType?: "image/jpeg" | "image/png" | "image/webp";
};

export type GenerateConsultantPlanResult = {
  plan: ConsultantPlan | null;
  meta: ConsultantPlanMeta;
};

export async function generateConsultantPlan(
  input: GenerateConsultantPlanInput,
): Promise<GenerateConsultantPlanResult> {
  const intention = input.intention.trim();
  if (intention.length < 8) {
    return {
      plan: null,
      meta: {
        status: "skipped",
        error: "Intenção muito curta para gerar plano.",
      },
    };
  }

  if (!isConsultantAiConfigured()) {
    return {
      plan: null,
      meta: {
        status: "skipped",
        error:
          "IA não configurada (GOOGLE_GENERATIVE_AI_API_KEY / GEMINI_API_KEY).",
      },
    };
  }

  const usedVision =
    Boolean(input.imageBuffer?.length) &&
    shouldUseVision({ intention, goals: input.goals });

  try {
    const { model, label } = resolveModel();
    const userText = [
      factsBlock({
        intention,
        goals: input.goals.map(String),
        context: input.context,
        seasonId: input.seasonId,
        seasonName: input.seasonName,
        undertoneLabel: input.undertoneLabel,
        confidence: input.confidence,
        features: input.features,
        photoQuality: input.photoQuality,
      }),
      usedVision
        ? "A foto do rosto está anexada. Use-a só para avaliar traços/pele relacionados à intenção; ignore fundo e roupas."
        : "Sem foto nesta chamada — baseie-se só na intenção e nos fatos do motor.",
      "Gere o plano estruturado agora.",
    ].join("\n\n");

    const content: Array<
      | { type: "text"; text: string }
      | { type: "file"; mediaType: string; data: Buffer }
    > = [{ type: "text", text: userText }];

    if (usedVision && input.imageBuffer) {
      content.push({
        type: "file",
        mediaType: input.imageMediaType || "image/jpeg",
        data: input.imageBuffer,
      });
    }

    const { output } = await generateText({
      model,
      system: SYSTEM,
      output: Output.object({ schema: consultantPlanSchema }),
      messages: [{ role: "user", content }],
      temperature: 0.4,
      maxOutputTokens: 1800,
    });

    if (!output) {
      return {
        plan: null,
        meta: {
          status: "error",
          model: label,
          usedVision,
          error: "Modelo não retornou plano estruturado.",
          generatedAt: new Date().toISOString(),
        },
      };
    }

    return {
      plan: output,
      meta: {
        status: "ok",
        model: label,
        usedVision,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    return {
      plan: null,
      meta: {
        status: "error",
        usedVision,
        error: err instanceof Error ? err.message : "Falha na consultora IA.",
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

/** Parse seguro de JSON já persistido. */
export function parseConsultantPlan(raw: unknown): ConsultantPlan | null {
  const parsed = consultantPlanSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

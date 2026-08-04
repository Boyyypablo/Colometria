import { readUpload, saveUserImage } from "@/lib/storage/local";
import type { VtoProvider, VtoRunInput } from "../types";
import { getGeminiApiKey, isGeminiConfigured } from "../types";
import { buildKontextPrompt } from "../color-edit";
import { detectSimulationScene } from "../scene";

const MODEL_ID =
  process.env.GEMINI_VTO_MODEL || "gemini-2.5-flash-image";


type GeminiPart = {
  text?: string;
  inlineData?: { mimeType: string; data: string };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  error?: { message?: string; status?: string; code?: number };
};

export const geminiVtoProvider: VtoProvider = {
  id: "gemini",
  async run(input: VtoRunInput) {
    if (!isGeminiConfigured()) {
      throw new Error(
        "Simulação com Gemini exige GEMINI_API_KEY (ou GOOGLE_API_KEY) no .env.",
      );
    }

    const apiKey = getGeminiApiKey();
    const buffer = await readUpload(input.inputRelative);
    // Limite prático de inline (~7MB); comprimir via sharp se necessário seria próximo passo
    if (buffer.byteLength > 7 * 1024 * 1024) {
      throw new Error("Foto muito grande para Gemini (máx. ~7MB). Use uma imagem menor.");
    }

    const scene = detectSimulationScene(input.faceBox);
    const prompt = buildKontextPrompt(input.hex, input.type, scene);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: buffer.toString("base64"),
                },
              },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    });


    const json = (await res.json()) as GeminiResponse;
    if (!res.ok) {
      const msg = json.error?.message || `HTTP ${res.status}`;
      if (res.status === 400 && /API key/i.test(msg)) {
        throw new Error("GEMINI_API_KEY inválida. Gere outra em https://aistudio.google.com/apikey");
      }
      if (res.status === 403 || res.status === 401) {
        throw new Error(
          `Gemini recusou a chave (${res.status}). Verifique GEMINI_API_KEY e se o modelo de imagem está habilitado na conta.`,
        );
      }
      throw new Error(`Gemini: ${msg}`);
    }

    const parts = json.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData?.data);
    if (!imagePart?.inlineData?.data) {
      const text = parts.map((p) => p.text).filter(Boolean).join(" ");
      throw new Error(
        text
          ? `Gemini não retornou imagem. Resposta: ${text.slice(0, 240)}`
          : "Gemini não retornou imagem. Tente outra foto ou modelo (GEMINI_VTO_MODEL).",
      );
    }

    const out = Buffer.from(imagePart.inlineData.data, "base64");
    const ext = imagePart.inlineData.mimeType?.includes("png") ? "png" : "jpg";
    const outputPath = await saveUserImage(input.userId, out, ext);
    return { outputPath, providerJobId: `scene:${scene}` };
  },
};

import { fal } from "@fal-ai/client";
import { readUpload, saveUserImage } from "@/lib/storage/local";
import type { VtoProvider, VtoRunInput } from "../types";
import { isFalConfigured } from "../types";
import { buildKontextPrompt } from "../color-edit";
import { detectSimulationScene } from "../scene";

const MODEL_ID =
  process.env.FAL_VTO_MODEL || "fal-ai/flux/dev/image-to-image";


function readFalKey(): string {
  return (process.env.FAL_KEY || "").trim().replace(/^["']|["']$/g, "");
}

function ensureFalConfigured() {
  const key = readFalKey();
  if (!key) {
    throw new Error(
      "Simulação visual exige FAL_KEY. Configure a chave em .env (fal.ai) ou use VTO_PROVIDER=mock.",
    );
  }
  fal.config({ credentials: key });
  return key;
}

function formatFalError(err: unknown): Error {
  if (!(err instanceof Error)) {
    return new Error(String(err));
  }
  const anyErr = err as Error & { status?: number };
  const status = anyErr.status;
  const msg = anyErr.message || "erro desconhecido";
  if (status === 401 || status === 403 || /forbidden|unauthorized/i.test(msg)) {
    return new Error(
      "fal.ai recusou a autenticação (Forbidden). Confira FAL_KEY no formato KEY_ID:KEY_SECRET em https://fal.ai/dashboard/keys e se a conta tem créditos.",
    );
  }
  if (status === 402 || /payment|credit|balance/i.test(msg)) {
    return new Error(
      "fal.ai sem créditos. Adicione saldo em https://fal.ai/dashboard/billing.",
    );
  }
  return new Error(`fal.ai: ${msg}`);
}

export const falVtoProvider: VtoProvider = {
  id: "fal",
  async run(input: VtoRunInput) {
    if (!isFalConfigured()) {
      throw new Error(
        "Simulação visual exige FAL_KEY válida (KEY_ID:KEY_SECRET).",
      );
    }

    try {
      ensureFalConfigured();
      const buffer = await readUpload(input.inputRelative);
      const scene = detectSimulationScene(input.faceBox);
      const file = new File([new Uint8Array(buffer)], "selfie.jpg", {
        type: "image/jpeg",
      });
      const imageUrl = await fal.storage.upload(file);

      const strength = Number.parseFloat(process.env.FAL_VTO_STRENGTH || "0.62");
      const result = await fal.subscribe(MODEL_ID, {
        input: {
          image_url: imageUrl,
          prompt: buildKontextPrompt(input.hex, input.type, scene),
          strength: Number.isFinite(strength) ? strength : 0.62,
          num_images: 1,
          output_format: "jpeg",
          num_inference_steps: 28,
          guidance_scale: 3.5,
        },
        logs: false,
      });


      const data = result.data as {
        images?: Array<{ url: string }>;
        request_id?: string;
      };
      const url = data.images?.[0]?.url;
      if (!url) {
        throw new Error("fal.ai não retornou imagem.");
      }
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        throw new Error("URL de imagem inválida.");
      }
      if (parsed.protocol !== "https:") {
        throw new Error("URL de imagem deve ser HTTPS.");
      }
      const host = parsed.hostname.toLowerCase();
      const allowedHost =
        host === "fal.media" ||
        host.endsWith(".fal.media") ||
        host === "fal.ai" ||
        host.endsWith(".fal.ai");
      if (!allowedHost) {
        throw new Error("Host de imagem não permitido.");
      }

      const imgRes = await fetch(url);
      if (!imgRes.ok) {
        throw new Error(`Falha ao baixar imagem gerada (${imgRes.status}).`);
      }
      const len = Number(imgRes.headers.get("content-length") || 0);
      if (len > 15 * 1024 * 1024) {
        throw new Error("Imagem gerada excede o tamanho máximo.");
      }
      const out = Buffer.from(await imgRes.arrayBuffer());
      if (out.byteLength > 15 * 1024 * 1024) {
        throw new Error("Imagem gerada excede o tamanho máximo.");
      }
      const outputPath = await saveUserImage(input.userId, out, "jpg");

      const requestId =
        (result as { requestId?: string }).requestId || data.request_id;
      return {
        outputPath,
        providerJobId: requestId
          ? `${requestId}|scene:${scene}`
          : `scene:${scene}`,
      };
    } catch (err) {
      console.error("[vto/fal]", err);
      throw formatFalError(err);
    }
  },
};

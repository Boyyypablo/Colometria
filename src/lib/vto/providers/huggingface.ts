import { InferenceClient } from "@huggingface/inference";
import { readUpload, saveUserImage } from "@/lib/storage/local";
import type { VtoProvider, VtoRunInput } from "../types";
import { getHuggingFaceToken, isHuggingFaceConfigured } from "../types";
import {
  applyVisibleColorOverlay,
  buildKontextPrompt,
  COLOR_MATCH_THRESHOLD,
  torsoColorDistance,
} from "../color-edit";
import { composeFaceOntoColoredBody } from "../face-body";
import { detectSimulationScene } from "../scene";

/** Modelo de edição img2img via Inference Providers. */
const MODEL_ID =
  process.env.HF_VTO_MODEL || "black-forest-labs/FLUX.1-Kontext-dev";

export const huggingfaceVtoProvider: VtoProvider = {
  id: "huggingface",
  async run(input: VtoRunInput) {
    if (!isHuggingFaceConfigured()) {
      throw new Error(
        "Simulação com Hugging Face exige HF_TOKEN no .env (https://huggingface.co/settings/tokens — permissão Inference Providers).",
      );
    }

    const token = getHuggingFaceToken();
    const client = new InferenceClient(token);
    const buffer = await readUpload(input.inputRelative);
    const scene = detectSimulationScene(input.faceBox);
    const blob = new Blob([new Uint8Array(buffer)], { type: "image/jpeg" });
    const prompt = buildKontextPrompt(input.hex, input.type, scene);

    try {
      const outBlob = await client.imageToImage({
        model: MODEL_ID,
        inputs: blob,
        parameters: {
          prompt,
          // Quanto maior, mais aderência ao prompt de edição (Kontext)
          guidance_scale: Number(process.env.HF_VTO_GUIDANCE || 4.5),
          num_inference_steps: Number(process.env.HF_VTO_STEPS || 30),
        },
      });

      let out: Buffer = Buffer.from(await outBlob.arrayBuffer());

      const dist = await torsoColorDistance(
        out,
        input.hex,
        input.type,
        input.faceBox,
      );

      if (dist > COLOR_MATCH_THRESHOLD) {
        console.warn(
          `[vto/huggingface] cena=${scene} cor pouco alterada (dist=${dist.toFixed(1)}). Aplicando fallback.`,
        );
        if (scene === "face_closeup" && input.type === "BLOUSE_TONE") {
          out = Buffer.from(
            await composeFaceOntoColoredBody(
              buffer,
              input.hex,
              input.faceBox,
            ),
          );
        } else {
          out = Buffer.from(
            await applyVisibleColorOverlay(
              out,
              input.hex,
              input.type,
              input.faceBox,
            ),
          );
        }
      }

      const outputPath = await saveUserImage(input.userId, out, "jpg");
      return {
        outputPath,
        providerJobId: `scene:${scene}`,
      };
    } catch (err) {
      console.error("[vto/huggingface]", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (/401|unauthorized|invalid.*token/i.test(msg)) {
        throw new Error(
          "HF_TOKEN inválido. Crie um token fine-grained com “Make calls to Inference Providers” em https://huggingface.co/settings/tokens",
        );
      }
      if (/402|credit|billing|quota|payment/i.test(msg)) {
        throw new Error(
          "Créditos Hugging Face esgotados. Veja https://huggingface.co/settings/billing — free users recebem créditos mensais.",
        );
      }
      if (/503|loading|warmup/i.test(msg)) {
        throw new Error(
          "Modelo Hugging Face aquecendo. Aguarde ~20s e tente de novo.",
        );
      }
      throw new Error(`Hugging Face: ${msg}`);
    }
  },
};

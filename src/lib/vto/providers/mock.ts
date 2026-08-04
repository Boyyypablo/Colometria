import sharp from "sharp";
import { saveUserImage, readUpload } from "@/lib/storage/local";
import type { VtoProvider, VtoRunInput } from "../types";
import { applyVisibleColorOverlay } from "../color-edit";
import { composeFaceOntoColoredBody } from "../face-body";
import { detectSimulationScene } from "../scene";

/** Fallback local (Sharp) — recolor de roupa ou face+corpo conforme a cena. */
export const mockVtoProvider: VtoProvider = {
  id: "mock",
  async run(input: VtoRunInput) {
    const file = await readUpload(input.inputRelative);
    const scene = detectSimulationScene(input.faceBox);

    let composed: Buffer;
    if (scene === "face_closeup" && input.type === "BLOUSE_TONE") {
      composed = await composeFaceOntoColoredBody(
        file,
        input.hex,
        input.faceBox,
      );
    } else {
      composed = await applyVisibleColorOverlay(
        file,
        input.hex,
        input.type,
        input.faceBox,
      );
    }

    const jpeg = await sharp(composed).jpeg({ quality: 88 }).toBuffer();
    return {
      outputPath: await saveUserImage(input.userId, jpeg, "jpg"),
      providerJobId: `scene:${scene}`,
    };
  },
};

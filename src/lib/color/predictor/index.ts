import { RulesColorPredictor } from "./rules";
import {
  resolvePredictorId,
  type ColorPredictor,
  type ColorPredictorId,
} from "./types";

const rules = new RulesColorPredictor();

export function createColorPredictor(id?: ColorPredictorId): ColorPredictor {
  const resolved = id ?? resolvePredictorId();
  if (resolved === "tabular-v1") {
    // Swap futuro: carregar ModelVersion ativa. Até lá, rules.
    return rules;
  }
  return rules;
}

export type { ColorPredictor, ColorPredictorId } from "./types";
export { resolvePredictorId } from "./types";

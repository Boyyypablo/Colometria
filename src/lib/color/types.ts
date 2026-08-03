export type Temperature = "warm" | "cool";
export type ValueLevel = "light" | "medium" | "deep";
export type ChromaLevel = "bright" | "soft" | "muted";

export type ColorSwatch = {
  hex: string;
  label: string;
  context?: Array<"trabalho" | "casual" | "noite">;
};

export type SeasonDefinition = {
  id: string;
  namePt: string;
  nameEn: string;
  temperature: Temperature;
  value: ValueLevel;
  chroma: ChromaLevel;
  description: string;
  useColors: string[];
  avoidColors: string[];
  clothing: ColorSwatch[];
  lipstick: ColorSwatch[];
  eyeshadow: ColorSwatch[];
  base: ColorSwatch[];
};

export type LabColor = {
  L: number;
  a: number;
  b: number;
};

export type ColorFeatures = {
  lab: LabColor;
  temperatureScore: number;
  valueScore: number;
  chromaScore: number;
  contrastScore: number;
  skinPixelRatio: number;
  sampleCount: number;
};

export type PhotoQuality = {
  width: number;
  height: number;
  faceLikeDetected: boolean;
  lightingWarning: boolean;
  warnings: string[];
};

export type ClassificationResult = {
  seasonId: string;
  confidence: number;
  undertoneLabel: string;
  features: ColorFeatures;
  photoQuality: PhotoQuality;
  needsReview: boolean;
};

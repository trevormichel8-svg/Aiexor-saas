export type ProviderId = "openai" | "vertex";

export type AspectPreset = "square" | "landscape" | "portrait";

export type OpenAIImageSize = "1024x1024" | "1536x1024" | "1024x1536" | "auto";
export type OpenAIQuality = "auto" | "high" | "medium" | "low";

export type GenerationSettings = {
  provider: ProviderId;
  aspect: AspectPreset;
  openai: {
    size: OpenAIImageSize;
    quality: OpenAIQuality;
  };
  vertex: {
    aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
    sampleCount: number;
  };
  seed?: number;
};

export const DEFAULT_SETTINGS: GenerationSettings = {
  provider: "openai",
  aspect: "square",
  openai: {
    size: "1024x1024",
    quality: "auto",
  },
  vertex: {
    aspectRatio: "1:1",
    sampleCount: 1,
  },
};

export function aspectToOpenAISize(aspect: AspectPreset): OpenAIImageSize {
  if (aspect === "landscape") return "1536x1024";
  if (aspect === "portrait") return "1024x1536";
  return "1024x1024";
}

export function aspectToVertexRatio(aspect: AspectPreset): GenerationSettings["vertex"]["aspectRatio"] {
  if (aspect === "landscape") return "16:9";
  if (aspect === "portrait") return "9:16";
  return "1:1";
}

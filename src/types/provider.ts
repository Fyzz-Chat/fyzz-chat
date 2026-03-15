import type { LanguageModelV3, SharedV3ProviderOptions } from "@ai-sdk/provider";
import type { Tool } from "ai";
import type { CustomMetadata, CustomUIMessage } from "@/types/chat";

export type Feature = {
  name: string;
  description: string;
  icon: string;
  color: string;
};

export const imageTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"] as const;
export type ImageType = (typeof imageTypes)[number];

export const pdfType = "application/pdf" as const;
export type PDFType = typeof pdfType;

export const audioType = [
  "audio/mp3",
  "audio/flac",
  "audio/ogg",
  "audio/mpeg",
  "audio/wav",
  "audio/aac",
  "audio/x-m4a",
] as const;
export type AudioType = (typeof audioType)[number];

export const videoType = "video/mp4" as const;
export type VideoType = typeof videoType;

export const tabularType = "text/csv" as const;
export type TabularType = typeof tabularType;

export const plaintextType = "text/plain" as const;
export type PlaintextType = typeof plaintextType;

export type ExtensionType =
  | ImageType
  | PDFType
  | AudioType
  | VideoType
  | TabularType
  | PlaintextType;
export type RuntimePreset = "chat" | "responses";
export type ReasoningEffort = "low" | "medium" | "high";

export type ModelCapabilities = {
  supportsCodeInterpreter?: boolean;
  supportsImageGeneration?: boolean;
  supportsXaiSearchTools?: boolean;
};

export type Model = {
  id: string;
  name: string;
  features?: Feature[];
  free?: boolean;
  provider: (model: string) => LanguageModelV3;
  tools: boolean;
  runtimePreset: RuntimePreset;
  extensions: readonly ExtensionType[];
  cost: number;
  capabilities?: ModelCapabilities;
};

export type ModelRuntime = {
  modelId: string;
  model: LanguageModelV3;
  supportsTools: boolean;
  runtimePreset: RuntimePreset;
  selectInputMessages: (messages: CustomUIMessage[]) => CustomUIMessage[];
  getProviderOptionsFromHistory: (messages: CustomUIMessage[]) => SharedV3ProviderOptions;
  decorateAssistantMetadata: (options: {
    metadata: CustomMetadata | undefined;
    responseId?: string;
  }) => CustomMetadata;
  getProviderTools: (search: boolean) => { [key: string]: Tool };
};

export type PublicModel = Omit<Model, "provider">;

export type ProviderId =
  | "azure"
  | "openai"
  | "anthropic"
  | "google"
  | "xai"
  | "llama"
  | "deepseek"
  | "qwen"
  | "other"
  | "perplexity";

export type Provider = {
  id: ProviderId;
  name: string;
  icon: string;
  models: Model[];
};

export type PublicProvider = Omit<Provider, "models"> & {
  models: PublicModel[];
};

import type { LanguageModelV3, SharedV3ProviderOptions } from "@ai-sdk/provider";
import type { Tool } from "ai";
import type { CustomMetadata, CustomUIMessage } from "@/types/chat";

export type Feature = {
  name: string;
  description: string;
  icon: string;
  color: string;
};

export type ImageType = "image/png" | "image/jpeg" | "image/jpg" | "image/webp";
export const imageTypes: ImageType[] = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

export type PDFType = "application/pdf";
export const pdfType: PDFType = "application/pdf";

export type AudioType =
  | "audio/mp3"
  | "audio/flac"
  | "audio/ogg"
  | "audio/mpeg"
  | "audio/wav"
  | "audio/aac"
  | "audio/x-m4a";
export const audioType: AudioType[] = [
  "audio/mp3",
  "audio/flac",
  "audio/ogg",
  "audio/mpeg",
  "audio/wav",
  "audio/aac",
  "audio/x-m4a",
];

export type VideoType = "video/mp4";
export const videoType: VideoType = "video/mp4";

export type TabularType = "text/csv";
export const tabularType: TabularType = "text/csv";

export type ExtensionType = ImageType | PDFType | AudioType | VideoType | TabularType;
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
  extensions: ExtensionType[];
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

import type { LanguageModel } from "ai";

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

export type Model = {
  id: string;
  name: string;
  features?: Feature[];
  free?: boolean;
  provider: (model: string, browse: boolean) => LanguageModel;
  tools: boolean;
  extensions: (ImageType | string)[];
};

export type PublicModel = Omit<Model, "provider">;

export type ProviderId =
  | "azure"
  | "openai"
  | "anthropic"
  | "google"
  | "xai"
  | "fireworks"
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

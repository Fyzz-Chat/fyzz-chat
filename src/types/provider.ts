import type { LanguageModelV1 } from "ai";

export type Feature = {
  name: string;
  description: string;
  icon: string;
  color: string;
};

export type Model = {
  id: string;
  name: string;
  features?: Feature[];
  free?: boolean;
  provider: (model: string, browse: boolean) => LanguageModelV1;
  tools: boolean;
};

export type PublicModel = Omit<Model, "provider">;

export type Provider = {
  id: string;
  name: string;
  icon: string;
  models: Model[];
};

export type PublicProvider = Omit<Provider, "models"> & {
  models: PublicModel[];
};

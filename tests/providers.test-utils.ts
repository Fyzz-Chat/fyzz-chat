import { mock } from "bun:test";

mock.module("server-only", () => ({}));

const providerEnvKeys = [
  "OPENAI_API_KEY",
  "XAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "FIREWORKS_API_KEY",
  "PERPLEXITY_API_KEY",
  "AZURE_API_KEY",
  "AZURE_RESOURCE_NAME",
] as const;

type ProviderEnvKey = (typeof providerEnvKeys)[number];

const providerTestEnv: Record<ProviderEnvKey, string | undefined> = {
  OPENAI_API_KEY: "test-openai-key",
  XAI_API_KEY: "test-xai-key",
  ANTHROPIC_API_KEY: "test-anthropic-key",
  GOOGLE_GENERATIVE_AI_API_KEY: "test-google-key",
  FIREWORKS_API_KEY: "test-fireworks-key",
  PERPLEXITY_API_KEY: "test-perplexity-key",
  AZURE_API_KEY: undefined,
  AZURE_RESOURCE_NAME: undefined,
};

const originalProviderEnv = providerEnvKeys.reduce<
  Partial<Record<ProviderEnvKey, string | undefined>>
>((acc, key) => {
  acc[key] = process.env[key];
  return acc;
}, {});

export function setupProviderTestEnv() {
  for (const key of providerEnvKeys) {
    const value = providerTestEnv[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

export function restoreProviderTestEnv() {
  for (const key of providerEnvKeys) {
    const value = originalProviderEnv[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

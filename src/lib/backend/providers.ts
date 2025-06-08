import "server-only";

import type {
  Feature,
  Model,
  Provider,
  PublicModel,
  PublicProvider,
} from "@/types/provider";
import { type AnthropicProvider, anthropic } from "@ai-sdk/anthropic";
import type { AzureOpenAIProvider } from "@ai-sdk/azure";
import { createAzure } from "@ai-sdk/azure";
import { type FireworksProvider, fireworks } from "@ai-sdk/fireworks";
import { google } from "@ai-sdk/google";
import { type OpenAIProvider, openai } from "@ai-sdk/openai";
import { type PerplexityProvider, perplexity } from "@ai-sdk/perplexity";
import { type XaiProvider, xai } from "@ai-sdk/xai";
import { wrapLanguageModel } from "ai";
import { extractReasoningMiddleware } from "ai";

const azureConfigured =
  process.env.AZURE_API_KEY !== undefined &&
  process.env.AZURE_RESOURCE_NAME !== undefined &&
  process.env.AZURE_GPT41_API_KEY !== undefined &&
  process.env.AZURE_GPT41_RESOURCE_NAME !== undefined;
const openaiConfigured = process.env.OPENAI_API_KEY !== undefined && !azureConfigured;
const anthropicConfigured = process.env.ANTHROPIC_API_KEY !== undefined;
const googleConfigured = process.env.GOOGLE_GENERATIVE_AI_API_KEY !== undefined;
const xaiConfigured = process.env.XAI_API_KEY !== undefined;
const metaConfigured = process.env.FIREWORKS_API_KEY !== undefined;
const deepseekConfigured = process.env.FIREWORKS_API_KEY !== undefined;
const perplexityConfigured = process.env.PERPLEXITY_API_KEY !== undefined;

export function getProvidersPublic(): PublicProvider[] {
  return filterProviders().map((provider) => ({
    ...provider,
    models: provider.models.map(({ provider, ...rest }) => ({
      ...rest,
    })),
  }));
}

export function countModels() {
  return getProvidersPublic().flatMap((provider) => provider.models).length;
}

export function getModelPublic(modelId: string): PublicModel | undefined {
  return getProvidersPublic()
    .flatMap((provider) => provider.models)
    .find((model) => model.id === modelId);
}

export function getModel(modelId: string, browse: boolean) {
  const model = filterProviders()
    .flatMap((provider) => provider.models)
    .find((model) => model.id === modelId);

  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }

  const { id, provider, tools } = model;

  return { model: provider(id, browse), supportsTools: tools };
}

function filterProviders(): Provider[] {
  return providers.filter((provider) => {
    if (provider.id === "azure" && !azureConfigured) {
      return false;
    }
    if (provider.id === "openai" && !openaiConfigured) {
      return false;
    }
    if (provider.id === "anthropic" && !anthropicConfigured) {
      return false;
    }
    if (provider.id === "google" && !googleConfigured) {
      return false;
    }
    if (provider.id === "xai" && !xaiConfigured) {
      return false;
    }
    if (provider.id === "fireworks" && !metaConfigured) {
      return false;
    }
    if (provider.id === "fireworks" && !deepseekConfigured) {
      return false;
    }
    if (provider.id === "perplexity" && !perplexityConfigured) {
      return false;
    }
    return true;
  });
}

const azure = createAzure({
  apiVersion: "2024-12-01-preview",
});

const azure41 = createAzure({
  apiVersion: "2024-12-01-preview",
  apiKey: process.env.AZURE_GPT41_API_KEY,
  resourceName: process.env.AZURE_GPT41_RESOURCE_NAME,
});

function wrappedGoogle(model: string, browse: boolean) {
  return google(model, { useSearchGrounding: browse });
}

function wrappedModel(
  provider:
    | AzureOpenAIProvider
    | OpenAIProvider
    | AnthropicProvider
    | XaiProvider
    | FireworksProvider
    | PerplexityProvider
) {
  return function (model: string, _browse: boolean) {
    return provider(model);
  };
}

const reasoningFireworks = (model: string, _browse: boolean) => {
  return wrapLanguageModel({
    model: fireworks(model),
    middleware: extractReasoningMiddleware({ tagName: "think" }),
  });
};

const reasoning: Feature = {
  name: "Reasoning",
  description: "Reasoning model",
  icon: "brain",
  color: "text-yellow-500",
};

const search: Feature = {
  name: "Search",
  description: "Searches the web for information",
  icon: "globe",
  color: "text-blue-500",
};

const coding: Feature = {
  name: "Coding",
  description: "Excels at coding tasks",
  icon: "codeXml",
  color: "text-green-500",
};

const images: Feature = {
  name: "Images",
  description: "Supports images",
  icon: "image",
  color: "text-orange-500",
};

const pdf: Feature = {
  name: "PDFs",
  description: "Supports PDFs",
  icon: "fileText",
  color: "text-purple-500",
};

const providers: Provider[] = [
  {
    id: "azure",
    name: "OpenAI",
    icon: "openai",
    models: [
      {
        id: "gpt-4o-mini",
        name: "GPT-4o mini",
        features: [images],
        provider: wrappedModel(azure),
        tools: true,
      },
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        features: [images, coding],
        provider: wrappedModel(azure41),
        tools: true,
      },
      {
        id: "gpt-4.1-mini",
        name: "GPT-4.1 mini",
        features: [images, coding],
        provider: wrappedModel(azure41),
        tools: true,
      },
      {
        id: "o3-mini",
        name: "o3-mini",
        features: [reasoning],
        provider: wrappedModel(azure),
        tools: true,
      },
      {
        id: "o4-mini",
        name: "o4-mini",
        features: [images, reasoning],
        provider: wrappedModel(azure41),
        tools: true,
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: "openai",
    models: [
      {
        id: "gpt-4o-mini",
        name: "GPT-4o mini",
        features: [images],
        provider: wrappedModel(openai),
        tools: true,
      },
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        features: [images, coding],
        provider: wrappedModel(openai),
        tools: true,
      },
      {
        id: "gpt-4.1-mini",
        name: "GPT-4.1 mini",
        features: [images, coding],
        provider: wrappedModel(openai),
        tools: true,
      },
      {
        id: "o3-mini",
        name: "o3-mini",
        features: [reasoning],
        provider: wrappedModel(openai),
        tools: true,
      },
      {
        id: "o4-mini",
        name: "o4-mini",
        features: [images, reasoning],
        provider: wrappedModel(openai),
        tools: true,
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    icon: "anthropic",
    models: [
      {
        id: "claude-3-5-sonnet-20240620",
        name: "Claude 3.5 Sonnet",
        features: [images, pdf],
        provider: wrappedModel(anthropic),
        tools: true,
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        features: [images, pdf],
        provider: wrappedModel(anthropic),
        tools: true,
      },
      {
        id: "claude-3-7-sonnet-20250219",
        name: "Claude 3.7 Sonnet",
        features: [images, pdf, reasoning],
        provider: wrappedModel(anthropic),
        tools: true,
      },
      {
        id: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
        features: [images, pdf, reasoning],
        provider: wrappedModel(anthropic),
        tools: true,
      },
      {
        id: "claude-opus-4-20250514",
        name: "Claude Opus 4",
        features: [images, pdf, reasoning],
        provider: wrappedModel(anthropic),
        tools: true,
      },
    ],
  },
  {
    id: "google",
    name: "Google",
    icon: "google",
    models: [
      {
        id: "gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash Lite",
        features: [images, pdf],
        provider: wrappedGoogle,
        tools: true,
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        features: [images, pdf, search],
        provider: wrappedGoogle,
        tools: true,
      },
      {
        id: "gemini-2.5-flash-preview-04-17",
        name: "Gemini 2.5 Flash",
        features: [images, pdf, search],
        provider: wrappedGoogle,
        tools: true,
      },
      {
        id: "models/gemini-2.5-pro-preview-03-25",
        name: "Gemini 2.5 Pro",
        features: [images, pdf, reasoning],
        provider: wrappedGoogle,
        tools: true,
      },
    ],
  },
  {
    id: "xai",
    name: "xAI",
    icon: "xai",
    models: [
      {
        id: "grok-3-mini-beta",
        name: "Grok 3 mini",
        features: [reasoning],
        provider: wrappedModel(xai),
        tools: true,
      },
      {
        id: "grok-3-beta",
        name: "Grok 3",
        provider: wrappedModel(xai),
        tools: true,
      },
    ],
  },
  {
    id: "fireworks",
    name: "Meta",
    icon: "meta",
    models: [
      {
        id: "accounts/fireworks/models/llama4-scout-instruct-basic",
        name: "Llama 4 Scout",
        features: [images],
        provider: wrappedModel(fireworks),
        tools: true,
      },
      {
        id: "accounts/fireworks/models/llama4-maverick-instruct-basic",
        name: "Llama 4 Maverick",
        features: [images],
        provider: wrappedModel(fireworks),
        tools: true,
      },
      {
        id: "accounts/fireworks/models/llama-v3p1-405b-instruct",
        name: "Llama 3.1 405B",
        provider: wrappedModel(fireworks),
        tools: true,
      },
    ],
  },
  {
    id: "fireworks",
    name: "DeepSeek",
    icon: "deepseek",
    models: [
      {
        id: "accounts/fireworks/models/deepseek-v3",
        name: "DeepSeek V3",
        provider: wrappedModel(fireworks),
        tools: true,
      },
      {
        id: "accounts/fireworks/models/deepseek-r1",
        name: "DeepSeek R1",
        features: [reasoning],
        provider: reasoningFireworks,
        tools: false,
      },
    ],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    icon: "perplexity",
    models: [
      {
        id: "sonar",
        name: "Sonar",
        features: [search],
        provider: wrappedModel(perplexity),
        tools: false,
      },
      {
        id: "sonar-pro",
        name: "Sonar Pro",
        features: [search],
        provider: wrappedModel(perplexity),
        tools: false,
      },
    ],
  },
];

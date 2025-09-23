import "server-only";

import { codeInterpreterTool } from "@/lib/backend/tools/code-interpreter";
import {
  type Feature,
  type Provider,
  type PublicModel,
  type PublicProvider,
  imageTypes,
} from "@/types/provider";
import {
  type AnthropicProvider,
  type AnthropicProviderOptions,
  anthropic,
} from "@ai-sdk/anthropic";
import type { AzureOpenAIProvider } from "@ai-sdk/azure";
import { createAzure } from "@ai-sdk/azure";
import { type FireworksProvider, fireworks } from "@ai-sdk/fireworks";
import { google } from "@ai-sdk/google";
import {
  type OpenAIProvider,
  type OpenAIResponsesProviderOptions,
  openai,
} from "@ai-sdk/openai";
import { type PerplexityProvider, perplexity } from "@ai-sdk/perplexity";
import { type XaiProvider, xai } from "@ai-sdk/xai";
import { extractReasoningMiddleware, wrapLanguageModel } from "ai";

const azureConfigured =
  process.env.AZURE_API_KEY !== undefined &&
  process.env.AZURE_RESOURCE_NAME !== undefined; // &&
// process.env.AZURE_GPT41_API_KEY !== undefined &&
// process.env.AZURE_GPT41_RESOURCE_NAME !== undefined;
export const openaiConfigured = process.env.OPENAI_API_KEY !== undefined;
const openaiConfiguredAzureNot = openaiConfigured && !azureConfigured;
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

export function getAnthropicProviderOptions(modelId: string): AnthropicProviderOptions {
  return {
    thinking: isThinkingModel(modelId, "anthropic")
      ? { type: "enabled", budgetTokens: 5000 }
      : { type: "disabled" },
  };
}

export function getOpenaiProviderOptions(
  modelId: string
): OpenAIResponsesProviderOptions {
  const provider = azureConfigured ? "azure" : openaiConfiguredAzureNot ? "openai" : "";

  return {
    reasoningEffort: isThinkingModel(modelId, provider) ? "low" : undefined,
    reasoningSummary: isThinkingModel(modelId, provider) ? "detailed" : undefined,
  };
}

export function getGoogleProviderOptions(modelId: string): {
  thinkingConfig?: { thinkingBudget: number; includeThoughts: boolean };
} {
  const thinkingModel = isThinkingModel(modelId, "google");

  return thinkingModel
    ? {
        thinkingConfig: {
          thinkingBudget: 8192,
          includeThoughts: true,
        },
      }
    : {};
}

export function getProviderTools(modelId: string) {
  const isOpenAIModel = providers.some(
    (provider) =>
      (provider.id === "openai" || provider.id === "azure") &&
      provider.models.some((model) => model.id === modelId)
  );
  const isAnthropicModel = providers.some(
    (provider) =>
      provider.id === "anthropic" && provider.models.some((model) => model.id === modelId)
  );
  if (isOpenAIModel) {
    return {
      code_interpreter: codeInterpreterTool(modelId),
      web_search: openai.tools.webSearch(),
    };
  } else if (isAnthropicModel) {
    return {
      web_search: anthropic.tools.webSearch_20250305({ maxUses: 5 }),
    };
  }
}

function isThinkingModel(modelId: string, providerId: string) {
  const model = filterProviders()
    .filter((provider) => provider.id === providerId)
    .flatMap((provider) => provider.models)
    .find((model) => model.id === modelId);

  return model?.features?.includes(reasoning);
}

function filterProviders(): Provider[] {
  return providers.filter((provider) => {
    if (provider.id === "azure" && !azureConfigured) {
      return false;
    }
    if (provider.id === "openai" && !openaiConfiguredAzureNot) {
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

const azure = createAzure();

// const azure41 = createAzure({
//   apiVersion: "2024-12-01-preview",
//   apiKey: process.env.AZURE_GPT41_API_KEY,
//   resourceName: process.env.AZURE_GPT41_RESOURCE_NAME,
// });

function wrappedGoogle(model: string, _browse: boolean) {
  return google(model); //, { useSearchGrounding: browse });
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
        extensions: imageTypes,
      },
      {
        id: "gpt-5",
        name: "GPT-5",
        features: [images, reasoning, search, coding],
        provider: wrappedModel(openai), // TODO: Change to azure when application approved
        tools: true,
        extensions: imageTypes,
      },
      {
        id: "gpt-5-mini",
        name: "GPT-5 mini",
        features: [images, reasoning, search, coding],
        provider: wrappedModel(openai), // TODO: Change to azure when application approved
        tools: true,
        extensions: imageTypes,
      },
      {
        id: "gpt-5-nano",
        name: "GPT-5 nano",
        features: [images, reasoning, search, coding],
        provider: wrappedModel(openai), // TODO: Change to azure when application approved
        tools: true,
        extensions: imageTypes,
      },
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        features: [images],
        provider: wrappedModel(azure),
        tools: true,
        extensions: imageTypes,
      },
      {
        id: "gpt-4.1-mini",
        name: "GPT-4.1 mini",
        features: [images],
        provider: wrappedModel(azure),
        tools: true,
        extensions: imageTypes,
      },
      {
        id: "o3-mini",
        name: "o3-mini",
        features: [reasoning],
        provider: wrappedModel(azure),
        tools: true,
        extensions: [],
      },
      {
        id: "o4-mini",
        name: "o4-mini",
        features: [images, reasoning],
        provider: wrappedModel(azure),
        tools: true,
        extensions: imageTypes,
      },
      {
        id: "o3",
        name: "o3",
        features: [images, reasoning],
        provider: wrappedModel(azure),
        tools: true,
        extensions: imageTypes,
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
        extensions: imageTypes,
      },
      {
        id: "gpt-5",
        name: "GPT-5",
        features: [images, reasoning, search, coding],
        provider: wrappedModel(openai),
        tools: true,
        extensions: imageTypes,
      },
      {
        id: "gpt-5-mini",
        name: "GPT-5 mini",
        features: [images, reasoning, search, coding],
        provider: wrappedModel(openai),
        tools: true,
        extensions: imageTypes,
      },
      {
        id: "gpt-5-nano",
        name: "GPT-5 nano",
        features: [images, reasoning, search, coding],
        provider: wrappedModel(openai),
        tools: true,
        extensions: imageTypes,
      },
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        features: [images],
        provider: wrappedModel(openai),
        tools: true,
        extensions: imageTypes,
      },
      {
        id: "gpt-4.1-mini",
        name: "GPT-4.1 mini",
        features: [images],
        provider: wrappedModel(openai),
        tools: true,
        extensions: imageTypes,
      },
      {
        id: "o3-mini",
        name: "o3-mini",
        features: [reasoning],
        provider: wrappedModel(openai),
        tools: true,
        extensions: [],
      },
      {
        id: "o4-mini",
        name: "o4-mini",
        features: [images, reasoning],
        provider: wrappedModel(openai),
        tools: true,
        extensions: imageTypes,
      },
      {
        id: "o3",
        name: "o3",
        features: [images, reasoning],
        provider: wrappedModel(openai),
        tools: true,
        extensions: imageTypes,
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    icon: "anthropic",
    models: [
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        features: [images, pdf, search],
        provider: wrappedModel(anthropic),
        tools: true,
        extensions: [...imageTypes, "application/pdf"],
      },
      {
        id: "claude-3-7-sonnet-20250219",
        name: "Claude 3.7 Sonnet",
        features: [images, pdf, reasoning, search],
        provider: wrappedModel(anthropic),
        tools: true,
        extensions: [...imageTypes, "application/pdf"],
      },
      {
        id: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
        features: [images, pdf, reasoning, search],
        provider: wrappedModel(anthropic),
        tools: true,
        extensions: [...imageTypes, "application/pdf"],
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
        extensions: [...imageTypes, "application/pdf"],
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        features: [images, pdf, search],
        provider: wrappedGoogle,
        tools: true,
        extensions: [...imageTypes, "application/pdf"],
      },
      {
        id: "gemini-2.5-flash-image-preview",
        name: "Gemini 2.5 Flash Image Preview",
        features: [images],
        provider: wrappedGoogle,
        tools: false,
        extensions: [...imageTypes],
      },
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        features: [images, pdf, search],
        provider: wrappedGoogle,
        tools: true,
        extensions: [...imageTypes, "application/pdf"],
      },
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        features: [images, pdf, reasoning],
        provider: wrappedGoogle,
        tools: true,
        extensions: [...imageTypes, "application/pdf"],
      },
    ],
  },
  {
    id: "xai",
    name: "xAI",
    icon: "xai",
    models: [
      {
        id: "grok-4-0709",
        name: "Grok 4",
        features: [images, reasoning],
        provider: wrappedModel(xai),
        tools: true,
        extensions: imageTypes,
      },
      {
        id: "grok-3-mini-beta",
        name: "Grok 3 mini",
        features: [reasoning],
        provider: wrappedModel(xai),
        tools: true,
        extensions: [],
      },
      {
        id: "grok-3-beta",
        name: "Grok 3",
        provider: wrappedModel(xai),
        tools: true,
        extensions: [],
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
        features: [],
        provider: wrappedModel(fireworks),
        tools: true,
        extensions: [],
      },
      {
        id: "accounts/fireworks/models/llama4-maverick-instruct-basic",
        name: "Llama 4 Maverick",
        features: [],
        provider: wrappedModel(fireworks),
        tools: true,
        extensions: [],
      },
      {
        id: "accounts/fireworks/models/llama-v3p1-405b-instruct",
        name: "Llama 3.1 405B",
        provider: wrappedModel(fireworks),
        tools: true,
        extensions: [],
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
        extensions: [],
      },
      {
        id: "accounts/fireworks/models/deepseek-r1",
        name: "DeepSeek R1",
        features: [reasoning],
        provider: reasoningFireworks,
        tools: false,
        extensions: [],
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
        extensions: [],
      },
      {
        id: "sonar-pro",
        name: "Sonar Pro",
        features: [search],
        provider: wrappedModel(perplexity),
        tools: false,
        extensions: [],
      },
    ],
  },
];

import "server-only";

import {
  type AnthropicProvider,
  type AnthropicProviderOptions,
  anthropic,
} from "@ai-sdk/anthropic";
import type { AzureOpenAIProvider } from "@ai-sdk/azure";
import { createAzure } from "@ai-sdk/azure";
import { type FireworksProvider, fireworks } from "@ai-sdk/fireworks";
import { type GoogleGenerativeAIProviderOptions, google } from "@ai-sdk/google";
import {
  type OpenAIProvider,
  type OpenAIResponsesProviderOptions,
  openai,
} from "@ai-sdk/openai";
import { type PerplexityProvider, perplexity } from "@ai-sdk/perplexity";
import { type XaiProvider, xai } from "@ai-sdk/xai";
import {
  extractReasoningMiddleware,
  type Tool,
  type ToolSet,
  wrapLanguageModel,
} from "ai";
import {
  type Feature,
  imageTypes,
  type Provider,
  type PublicModel,
  type PublicProvider,
  pdfType,
  videoType,
} from "@/types/provider";

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

export function getGoogleProviderOptions(
  modelId: string
): GoogleGenerativeAIProviderOptions {
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

export function getProviderTools(modelId: string, search: boolean) {
  const isOpenAIModel = providers.some(
    (provider) =>
      (provider.id === "openai" || provider.id === "azure") &&
      provider.models.some((model) => model.id === modelId)
  );
  const isAnthropicModel = providers.some(
    (provider) =>
      provider.id === "anthropic" && provider.models.some((model) => model.id === modelId)
  );
  const isGoogleModel = providers.some(
    (provider) =>
      provider.id === "google" && provider.models.some((model) => model.id === modelId)
  );
  const supportsOpenAICodeInterpreter =
    isOpenAIModel &&
    modelId !== "gpt-5-codex" &&
    modelId !== "gpt-5.1-codex" &&
    modelId !== "o3-mini";

  const supportsOpenAIImageGeneration =
    isOpenAIModel && getModelPublic(modelId)?.features?.includes(images);

  const tools: ToolSet = {};

  if (isOpenAIModel) {
    if (supportsOpenAICodeInterpreter) {
      tools.code_interpreter = openai.tools.codeInterpreter() as Tool;
    }

    if (supportsOpenAIImageGeneration) {
      tools.image_generation = openai.tools.imageGeneration({
        model: "gpt-image-1.5",
        outputFormat: "jpeg",
        outputCompression: 50,
      }) as Tool;
    }

    if (search) {
      tools.web_search = openai.tools.webSearch() as Tool;
    }
  } else if (isAnthropicModel) {
    if (search) {
      tools.web_search = anthropic.tools.webSearch_20250305({ maxUses: 5 }) as Tool;
    }
  } else if (isGoogleModel) {
    if (search) {
      tools.google_search = google.tools.googleSearch({}) as Tool;
    }
  }

  return tools;
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
  return (model: string, _browse: boolean) => provider(model);
}

const _reasoningFireworks = (model: string, _browse: boolean) => {
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
  description: "Can generate images",
  icon: "image",
  color: "text-orange-500",
};

const providers: Provider[] = [
  {
    id: "azure",
    name: "OpenAI",
    icon: "openai",
    models: [
      {
        id: "gpt-4.1-mini",
        name: "GPT-4.1 mini",
        features: [images],
        provider: wrappedModel(azure),
        tools: true,
        extensions: imageTypes,
        cost: 1,
      },
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        features: [images],
        provider: wrappedModel(azure),
        tools: true,
        extensions: imageTypes,
        cost: 2,
      },
      {
        id: "gpt-5-nano",
        name: "GPT-5 nano",
        features: [reasoning, search, coding],
        provider: wrappedModel(azure),
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 1,
      },
      {
        id: "gpt-5-mini",
        name: "GPT-5 mini",
        features: [reasoning, search, coding],
        provider: wrappedModel(azure),
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 1,
      },
      {
        id: "gpt-5",
        name: "GPT-5",
        features: [reasoning, search, coding],
        provider: wrappedModel(azure),
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 2,
      },
      {
        id: "gpt-5-codex",
        name: "GPT-5 Codex",
        features: [reasoning, coding],
        provider: wrappedModel(openai), // TODO: Change to azure when available
        tools: true,
        extensions: imageTypes,
        cost: 2,
      },
      {
        id: "gpt-5.1",
        name: "GPT-5.1",
        features: [reasoning, search, coding],
        provider: wrappedModel(openai), // TODO: Change to azure when available
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 2,
      },
      {
        id: "gpt-5.1-codex",
        name: "GPT-5.1 Codex",
        features: [reasoning, coding],
        provider: wrappedModel(openai), // TODO: Change to azure when available
        tools: true,
        extensions: imageTypes,
        cost: 2,
      },
      {
        id: "gpt-5.2",
        name: "GPT-5.2",
        features: [reasoning, search, coding],
        provider: wrappedModel(openai), // TODO: Change to azure when available
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 3,
      },
      {
        id: "o3-mini",
        name: "o3-mini",
        features: [reasoning],
        provider: wrappedModel(azure),
        tools: true,
        extensions: [],
        cost: 1,
      },
      {
        id: "o4-mini",
        name: "o4-mini",
        features: [reasoning],
        provider: wrappedModel(azure),
        tools: true,
        extensions: imageTypes,
        cost: 1,
      },
      {
        id: "o3",
        name: "o3",
        features: [reasoning],
        provider: wrappedModel(azure),
        tools: true,
        extensions: imageTypes,
        cost: 2,
      },
      {
        id: "accounts/fireworks/models/gpt-oss-120b",
        name: "gpt-oss-120b",
        features: [reasoning],
        provider: wrappedModel(fireworks),
        tools: true,
        extensions: [],
        cost: 1,
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: "openai",
    models: [
      {
        id: "gpt-4.1-mini",
        name: "GPT-4.1 mini",
        features: [images],
        provider: wrappedModel(openai),
        tools: true,
        extensions: imageTypes,
        cost: 1,
      },
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        features: [images],
        provider: wrappedModel(openai),
        tools: true,
        extensions: imageTypes,
        cost: 2,
      },
      {
        id: "gpt-5-nano",
        name: "GPT-5 nano",
        features: [reasoning, search, coding],
        provider: wrappedModel(openai),
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 1,
      },
      {
        id: "gpt-5-mini",
        name: "GPT-5 mini",
        features: [reasoning, search, coding],
        provider: wrappedModel(openai),
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 1,
      },
      {
        id: "gpt-5",
        name: "GPT-5",
        features: [reasoning, search, coding],
        provider: wrappedModel(openai),
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 2,
      },
      {
        id: "gpt-5-codex",
        name: "GPT-5 Codex",
        features: [reasoning, coding],
        provider: wrappedModel(openai),
        tools: true,
        extensions: imageTypes,
        cost: 2,
      },
      {
        id: "gpt-5.1",
        name: "GPT-5.1",
        features: [reasoning, search, coding],
        provider: wrappedModel(openai),
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 2,
      },
      {
        id: "gpt-5.1-codex",
        name: "GPT-5.1 Codex",
        features: [reasoning, coding],
        provider: wrappedModel(openai),
        tools: true,
        extensions: imageTypes,
        cost: 2,
      },
      {
        id: "gpt-5.2",
        name: "GPT-5.2",
        features: [reasoning, search, coding],
        provider: wrappedModel(openai),
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 3,
      },
      {
        id: "o3-mini",
        name: "o3-mini",
        features: [reasoning],
        provider: wrappedModel(openai),
        tools: true,
        extensions: [],
        cost: 1,
      },
      {
        id: "o4-mini",
        name: "o4-mini",
        features: [reasoning],
        provider: wrappedModel(openai),
        tools: true,
        extensions: imageTypes,
        cost: 1,
      },
      {
        id: "o3",
        name: "o3",
        features: [reasoning],
        provider: wrappedModel(openai),
        tools: true,
        extensions: imageTypes,
        cost: 2,
      },
      {
        id: "accounts/fireworks/models/gpt-oss-120b",
        name: "gpt-oss-120b",
        features: [reasoning],
        provider: wrappedModel(fireworks),
        tools: true,
        extensions: [],
        cost: 1,
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    icon: "anthropic",
    models: [
      {
        id: "claude-3-haiku-20240307",
        name: "Claude Haiku 3",
        features: [search],
        provider: wrappedModel(anthropic),
        tools: true,
        extensions: [...imageTypes],
        cost: 1,
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude Haiku 3.5",
        features: [search],
        provider: wrappedModel(anthropic),
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 1,
      },
      {
        id: "claude-haiku-4-5-20251001",
        name: "Claude Haiku 4.5",
        features: [reasoning, search],
        provider: wrappedModel(anthropic),
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 1,
      },
      {
        id: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
        features: [reasoning, search],
        provider: wrappedModel(anthropic),
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 3,
      },
      {
        id: "claude-sonnet-4-5",
        name: "Claude Sonnet 4.5",
        features: [reasoning, search],
        provider: wrappedModel(anthropic),
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 3,
      },
      {
        id: "claude-opus-4-5-20251101",
        name: "Claude Opus 4.5",
        features: [reasoning, search],
        provider: wrappedModel(anthropic),
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 5,
      },
    ],
  },
  {
    id: "google",
    name: "Google",
    icon: "google",
    models: [
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        features: [search],
        provider: wrappedGoogle,
        tools: true,
        extensions: [...imageTypes, pdfType, videoType],
        cost: 1,
      },
      {
        id: "gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash Lite",
        features: [],
        provider: wrappedGoogle,
        tools: false,
        extensions: [...imageTypes],
        cost: 1,
      },
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        features: [reasoning, search],
        provider: wrappedGoogle,
        tools: true,
        extensions: [...imageTypes, pdfType, videoType],
        cost: 2,
      },
      {
        id: "gemini-3-flash-preview",
        name: "Gemini 3 Flash",
        features: [reasoning, search],
        provider: wrappedGoogle,
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 1,
      },
      {
        id: "gemini-3-pro-preview",
        name: "Gemini 3 Pro",
        features: [],
        provider: wrappedGoogle,
        tools: true,
        extensions: [...imageTypes, pdfType],
        cost: 3,
      },
      {
        id: "gemini-2.5-flash-image",
        name: "Nano Banana",
        features: [images],
        provider: wrappedGoogle,
        tools: false,
        extensions: [...imageTypes],
        cost: 1,
      },
      // {
      //   id: "gemini-3-pro-image-preview",
      //   name: "Nano Banana Pro",
      //   features: [images, reasoning],
      //   provider: wrappedGoogle,
      //   tools: false,
      //   extensions: [...imageTypes],
      //   cost: 5,
      // },
      {
        id: "gemma-3-27b-it",
        name: "Gemma 3 27B",
        provider: wrappedGoogle,
        tools: false,
        extensions: [...imageTypes],
        cost: 1,
      },
    ],
  },
  {
    id: "xai",
    name: "xAI",
    icon: "xai",
    models: [
      {
        id: "grok-3-mini",
        name: "Grok 3 mini",
        features: [reasoning],
        provider: wrappedModel(xai),
        tools: true,
        extensions: [],
        cost: 1,
      },
      {
        id: "grok-3",
        name: "Grok 3",
        provider: wrappedModel(xai),
        tools: true,
        extensions: [],
        cost: 3,
      },
      {
        id: "grok-4-0709",
        name: "Grok 4",
        features: [reasoning],
        provider: wrappedModel(xai),
        tools: true,
        extensions: imageTypes,
        cost: 3,
      },
      {
        id: "grok-4-fast-non-reasoning",
        name: "Grok 4 Fast",
        features: [],
        provider: wrappedModel(xai),
        tools: true,
        extensions: [...imageTypes, pdfType, videoType],
        cost: 1,
      },
      {
        id: "grok-code-fast-1",
        name: "Grok Code Fast 1",
        features: [coding, reasoning],
        provider: wrappedModel(xai),
        tools: true,
        extensions: [],
        cost: 1,
      },
      {
        id: "grok-4-1-fast-non-reasoning",
        name: "Grok 4.1 Fast",
        features: [],
        provider: wrappedModel(xai),
        tools: true,
        extensions: [...imageTypes],
        cost: 1,
      },
    ],
  },
  {
    id: "fireworks",
    name: "Meta",
    icon: "meta",
    models: [
      {
        id: "accounts/fireworks/models/llama4-maverick-instruct-basic",
        name: "Llama 4 Maverick",
        features: [],
        provider: wrappedModel(fireworks),
        tools: true,
        extensions: [...imageTypes],
        cost: 1,
      },
    ],
  },
  {
    id: "fireworks",
    name: "DeepSeek",
    icon: "deepseek",
    models: [
      {
        id: "accounts/fireworks/models/deepseek-v3p1",
        name: "DeepSeek V3.1",
        provider: wrappedModel(fireworks),
        tools: true,
        extensions: [],
        cost: 1,
      },
      {
        id: "accounts/fireworks/models/deepseek-v3p1-terminus",
        name: "DeepSeek V3.1 Terminus",
        provider: wrappedModel(fireworks),
        tools: true,
        extensions: [],
        cost: 1,
      },
    ],
  },
  {
    id: "fireworks",
    name: "Qwen",
    icon: "qwen",
    models: [
      {
        id: "fireworks/qwen3-coder-480b-a35b-instruct",
        name: "Qwen 3 Coder 480B",
        provider: wrappedModel(fireworks),
        tools: true,
        extensions: [],
        cost: 1,
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
        cost: 1,
      },
      {
        id: "sonar-pro",
        name: "Sonar Pro",
        features: [search],
        provider: wrappedModel(perplexity),
        tools: false,
        extensions: [],
        cost: 3,
      },
    ],
  },
];

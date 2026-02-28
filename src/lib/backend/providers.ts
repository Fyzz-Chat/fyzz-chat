import "server-only";

import {
  type AnthropicProvider,
  type AnthropicProviderOptions,
  anthropic,
} from "@ai-sdk/anthropic";
import type { AzureOpenAIProvider } from "@ai-sdk/azure";
import {
  type FireworksLanguageModelOptions,
  type FireworksProvider,
  fireworks,
} from "@ai-sdk/fireworks";
import { type GoogleGenerativeAIProviderOptions, google } from "@ai-sdk/google";
import {
  type OpenAIProvider,
  type OpenAIResponsesProviderOptions,
  openai,
} from "@ai-sdk/openai";
import { type PerplexityProvider, perplexity } from "@ai-sdk/perplexity";
import { type XaiProvider, type XaiResponsesProviderOptions, xai } from "@ai-sdk/xai";
import type { Tool, ToolSet } from "ai";
import type { CustomMetadata, CustomUIMessage } from "@/types/chat";
import {
  type Feature,
  imageTypes,
  type ModelCapabilities,
  type ModelRuntime,
  type Provider,
  type PublicModel,
  type PublicProvider,
  pdfType,
  type ReasoningEffort,
  type RuntimePreset,
  tabularType,
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
const fireworksConfigured = process.env.FIREWORKS_API_KEY !== undefined;
const perplexityConfigured = process.env.PERPLEXITY_API_KEY !== undefined;
const CHAT_INPUT_WINDOW_SIZE = 16;

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

export function getModelRuntime(
  modelId: string,
  browse: boolean,
  reasoningEffort?: ReasoningEffort
): ModelRuntime {
  const runtimeModel = filterProviders()
    .flatMap((provider) =>
      provider.models.map((model) => ({
        providerId: provider.id,
        model,
      }))
    )
    .find(({ model }) => model.id === modelId);

  if (!runtimeModel) {
    throw new Error(`Model ${modelId} not found`);
  }

  const {
    providerId,
    model: { id, provider, tools, runtimePreset, capabilities },
  } = runtimeModel;
  const hasReasoning = runtimeModel.model.features?.includes(reasoning) ?? false;
  const selectedReasoningEffort = hasReasoning ? reasoningEffort : undefined;

  return {
    model: provider(id, browse),
    supportsTools: tools,
    runtimePreset,
    selectInputMessages: (messages) =>
      resolveMessagesForRuntimePreset(messages, runtimePreset),
    getProviderOptionsFromHistory: (messages) => {
      const previousResponseId = getPreviousResponseId(messages);
      return {
        anthropic: getAnthropicProviderOptions(modelId, selectedReasoningEffort),
        openai: getOpenaiProviderOptions(modelId, selectedReasoningEffort),
        google: getGoogleProviderOptions(modelId, selectedReasoningEffort),
        xai: getXaiProviderOptions(
          runtimePreset,
          previousResponseId,
          selectedReasoningEffort
        ),
        fireworks: getFireworksProviderOptions(modelId, selectedReasoningEffort),
      };
    },
    decorateAssistantMetadata: ({ metadata, responseId }) =>
      decorateAssistantMetadata(metadata, runtimePreset, responseId),
    getProviderTools: (search) =>
      getProviderTools({
        providerId,
        search,
        capabilities,
      }),
  };
}

function getPreviousResponseId(messages: CustomUIMessage[]): string | undefined {
  return [...messages]
    .reverse()
    .find(
      (message) =>
        message.role === "assistant" &&
        typeof message.metadata?.providerResponseId === "string"
    )?.metadata?.providerResponseId;
}

function resolveMessagesForRuntimePreset(
  messages: CustomUIMessage[],
  runtimePreset: RuntimePreset
) {
  if (runtimePreset === "chat") {
    return messages.slice(-CHAT_INPUT_WINDOW_SIZE);
  }

  if (runtimePreset === "responses") {
    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    return latestUserMessage ? [latestUserMessage] : messages.slice(-1);
  }

  return messages;
}

function decorateAssistantMetadata(
  metadata: CustomMetadata | undefined,
  runtimePreset: RuntimePreset,
  responseId?: string
): CustomMetadata {
  const metadataWithTimestamp = {
    createdAt: metadata?.createdAt ?? new Date(),
    ...metadata,
  };

  if (runtimePreset !== "responses" || !responseId) {
    return metadataWithTimestamp;
  }

  return {
    ...metadataWithTimestamp,
    providerResponseId: responseId,
  };
}

export function getAnthropicProviderOptions(
  modelId: string,
  reasoningEffort?: ReasoningEffort
): AnthropicProviderOptions {
  return {
    thinking: isThinkingModel(modelId, "anthropic")
      ? { type: "enabled", budgetTokens: 5000 }
      : { type: "disabled" },
    effort: isThinkingModel(modelId, "anthropic") ? reasoningEffort : undefined,
  };
}

export function getOpenaiProviderOptions(
  modelId: string,
  reasoningEffort?: ReasoningEffort
): OpenAIResponsesProviderOptions {
  const provider = azureConfigured ? "azure" : openaiConfiguredAzureNot ? "openai" : "";

  return {
    reasoningEffort: isThinkingModel(modelId, provider)
      ? reasoningEffort || "low"
      : undefined,
    reasoningSummary: isThinkingModel(modelId, provider) ? "detailed" : undefined,
  };
}

export function getGoogleProviderOptions(
  modelId: string,
  reasoningEffort?: ReasoningEffort
): GoogleGenerativeAIProviderOptions {
  const thinkingModel = isThinkingModel(modelId, "google");

  return thinkingModel
    ? {
        thinkingConfig: {
          includeThoughts: true,
          ...(reasoningEffort ? { thinkingLevel: reasoningEffort } : {}),
        },
      }
    : {};
}

export function getXaiProviderOptions(
  runtimePreset: RuntimePreset,
  previousResponseId?: string,
  reasoningEffort?: ReasoningEffort
): XaiResponsesProviderOptions {
  if (runtimePreset !== "responses") {
    return {};
  }

  return {
    store: true,
    previousResponseId,
    reasoningEffort,
  };
}

export function getFireworksProviderOptions(
  modelId: string,
  reasoningEffort?: ReasoningEffort
): FireworksLanguageModelOptions {
  const thinkingModel = isThinkingModel(modelId, "fireworks");
  const budgetTokens =
    reasoningEffort === "low" ? 1024 : reasoningEffort === "medium" ? 4096 : 8192;

  return thinkingModel
    ? {
        thinking: { type: "enabled", budgetTokens },
        reasoningHistory: "preserved",
      }
    : {};
}

export function getProviderTools({
  providerId,
  search,
  capabilities,
}: {
  providerId: Provider["id"];
  search: boolean;
  capabilities?: ModelCapabilities;
}) {
  const isOpenAIModel = providerId === "openai" || providerId === "azure";
  const isAnthropicModel = providerId === "anthropic";
  const isGoogleModel = providerId === "google";
  const isXaiModel = providerId === "xai";
  const resolvedCapabilities = resolveToolCapabilities(providerId, capabilities);
  const supportsOpenAICodeInterpreter =
    isOpenAIModel && resolvedCapabilities.supportsCodeInterpreter;

  const supportsOpenAIImageGeneration =
    isOpenAIModel && resolvedCapabilities.supportsImageGeneration;
  const supportsXaiSearchTools =
    isXaiModel && resolvedCapabilities.supportsXaiSearchTools;

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
  } else if (supportsXaiSearchTools) {
    if (search) {
      tools.x_search = xai.tools.xSearch() as Tool;
      tools.web_search = xai.tools.webSearch() as Tool;
    }
  }

  return tools;
}

function resolveToolCapabilities(
  providerId: Provider["id"],
  capabilities?: ModelCapabilities
): Required<ModelCapabilities> {
  const defaults: Required<ModelCapabilities> = {
    supportsCodeInterpreter: false,
    supportsImageGeneration: false,
    supportsXaiSearchTools: false,
  };

  if (providerId === "openai" || providerId === "azure") {
    defaults.supportsCodeInterpreter = true;
  }

  return {
    ...defaults,
    ...capabilities,
  };
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
    if (provider.id === "llama" && !fireworksConfigured) {
      return false;
    }
    if (provider.id === "deepseek" && !fireworksConfigured) {
      return false;
    }
    if (provider.id === "qwen" && !fireworksConfigured) {
      return false;
    }
    if (provider.id === "other" && !fireworksConfigured) {
      return false;
    }
    if (provider.id === "perplexity" && !perplexityConfigured) {
      return false;
    }
    return true;
  });
}

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

function wrappedResponsesModel(provider: XaiProvider) {
  return (model: string, _browse: boolean) => provider.responses(model);
}

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
        runtimePreset: "chat",
        extensions: imageTypes,
        cost: 1,
        capabilities: { supportsImageGeneration: true },
      },
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        features: [images],
        provider: wrappedModel(openai),
        tools: true,
        runtimePreset: "chat",
        extensions: imageTypes,
        cost: 2,
        capabilities: { supportsImageGeneration: true },
      },
      {
        id: "gpt-5-nano",
        name: "GPT-5 nano",
        features: [reasoning, search, coding],
        provider: wrappedModel(openai),
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 1,
      },
      {
        id: "gpt-5-mini",
        name: "GPT-5 mini",
        features: [reasoning, search, coding],
        provider: wrappedModel(openai),
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 1,
      },
      {
        id: "gpt-5",
        name: "GPT-5",
        features: [reasoning, search, coding],
        provider: wrappedModel(openai),
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 2,
      },
      {
        id: "gpt-5-codex",
        name: "GPT-5 Codex",
        features: [reasoning, coding],
        provider: wrappedModel(openai),
        tools: true,
        runtimePreset: "chat",
        extensions: imageTypes,
        cost: 2,
        capabilities: { supportsCodeInterpreter: false },
      },
      {
        id: "gpt-5.1",
        name: "GPT-5.1",
        features: [reasoning, search, coding],
        provider: wrappedModel(openai),
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 2,
      },
      {
        id: "gpt-5.1-codex",
        name: "GPT-5.1 Codex",
        features: [reasoning, coding],
        provider: wrappedModel(openai),
        tools: true,
        runtimePreset: "chat",
        extensions: imageTypes,
        cost: 2,
        capabilities: { supportsCodeInterpreter: false },
      },
      {
        id: "gpt-5.2",
        name: "GPT-5.2",
        features: [reasoning, search, coding],
        provider: wrappedModel(openai),
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 3,
      },
      {
        id: "gpt-5.2-codex",
        name: "GPT-5.2 Codex",
        features: [reasoning],
        provider: wrappedModel(openai),
        tools: true,
        runtimePreset: "chat",
        extensions: imageTypes,
        cost: 3,
        capabilities: { supportsCodeInterpreter: false },
      },
      {
        id: "gpt-5.3-codex",
        name: "GPT-5.3 Codex",
        features: [reasoning],
        provider: wrappedModel(openai),
        tools: true,
        runtimePreset: "chat",
        extensions: imageTypes,
        cost: 3,
        capabilities: { supportsCodeInterpreter: false },
      },
      {
        id: "o3-mini",
        name: "o3-mini",
        features: [reasoning],
        provider: wrappedModel(openai),
        tools: true,
        runtimePreset: "chat",
        extensions: [],
        cost: 1,
        capabilities: { supportsCodeInterpreter: false },
      },
      {
        id: "o4-mini",
        name: "o4-mini",
        features: [reasoning],
        provider: wrappedModel(openai),
        tools: true,
        runtimePreset: "chat",
        extensions: imageTypes,
        cost: 1,
      },
      {
        id: "o3",
        name: "o3",
        features: [reasoning],
        provider: wrappedModel(openai),
        tools: true,
        runtimePreset: "chat",
        extensions: imageTypes,
        cost: 2,
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
        runtimePreset: "chat",
        extensions: [...imageTypes],
        cost: 1,
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude Haiku 3.5",
        features: [search],
        provider: wrappedModel(anthropic),
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 1,
      },
      {
        id: "claude-haiku-4-5-20251001",
        name: "Claude Haiku 4.5",
        features: [reasoning, search],
        provider: wrappedModel(anthropic),
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 1,
      },
      {
        id: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
        features: [reasoning, search],
        provider: wrappedModel(anthropic),
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 3,
      },
      {
        id: "claude-sonnet-4-5",
        name: "Claude Sonnet 4.5",
        features: [reasoning, search],
        provider: wrappedModel(anthropic),
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 3,
      },
      {
        id: "claude-sonnet-4-6",
        name: "Claude Sonnet 4.6",
        features: [reasoning, search],
        provider: wrappedModel(anthropic),
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 3,
      },
      {
        id: "claude-opus-4-5",
        name: "Claude Opus 4.5",
        features: [reasoning, search],
        provider: wrappedModel(anthropic),
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 5,
      },
      {
        id: "claude-opus-4-6",
        name: "Claude Opus 4.6",
        features: [reasoning, search],
        provider: wrappedModel(anthropic),
        tools: true,
        runtimePreset: "chat",
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
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, videoType, tabularType],
        cost: 1,
      },
      {
        id: "gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash Lite",
        features: [],
        provider: wrappedGoogle,
        tools: false,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, videoType, tabularType],
        cost: 1,
      },
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        features: [search],
        provider: wrappedGoogle,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, videoType, tabularType],
        cost: 2,
      },
      {
        id: "gemini-3-flash-preview",
        name: "Gemini 3 Flash",
        features: [reasoning, search],
        provider: wrappedGoogle,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, videoType, tabularType],
        cost: 1,
      },
      {
        id: "gemini-3-pro-preview",
        name: "Gemini 3 Pro",
        features: [],
        provider: wrappedGoogle,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, videoType, tabularType],
        cost: 4,
      },
      {
        id: "gemini-3.1-pro-preview",
        name: "Gemini 3.1 Pro",
        features: [reasoning, search],
        provider: wrappedGoogle,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, videoType],
        cost: 4,
      },
      {
        id: "gemini-2.5-flash-image",
        name: "Nano Banana",
        features: [images],
        provider: wrappedGoogle,
        tools: false,
        runtimePreset: "chat",
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
        runtimePreset: "chat",
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
        runtimePreset: "chat",
        extensions: [],
        cost: 1,
      },
      {
        id: "grok-3",
        name: "Grok 3",
        provider: wrappedModel(xai),
        tools: true,
        runtimePreset: "chat",
        extensions: [],
        cost: 3,
      },
      {
        id: "grok-4-0709",
        name: "Grok 4",
        features: [reasoning],
        provider: wrappedResponsesModel(xai),
        tools: true,
        runtimePreset: "responses",
        extensions: imageTypes,
        cost: 3,
        capabilities: { supportsXaiSearchTools: true },
      },
      {
        id: "grok-4-fast-non-reasoning",
        name: "Grok 4 Fast",
        features: [],
        provider: wrappedResponsesModel(xai),
        tools: true,
        runtimePreset: "responses",
        extensions: [...imageTypes, pdfType, videoType],
        cost: 1,
        capabilities: { supportsXaiSearchTools: true },
      },
      {
        id: "grok-code-fast-1",
        name: "Grok Code Fast 1",
        features: [coding, reasoning],
        provider: wrappedModel(xai),
        tools: true,
        runtimePreset: "chat",
        extensions: [],
        cost: 1,
      },
      {
        id: "grok-4-1-fast-non-reasoning",
        name: "Grok 4.1 Fast",
        features: [],
        provider: wrappedResponsesModel(xai),
        tools: true,
        runtimePreset: "responses",
        extensions: [...imageTypes],
        cost: 1,
        capabilities: { supportsXaiSearchTools: true },
      },
    ],
  },
  {
    id: "llama",
    name: "Meta",
    icon: "meta",
    models: [
      {
        id: "accounts/fireworks/models/llama4-maverick-instruct-basic",
        name: "Llama 4 Maverick",
        features: [],
        provider: wrappedModel(fireworks),
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes],
        cost: 1,
      },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: "deepseek",
    models: [
      {
        id: "accounts/fireworks/models/deepseek-v3p1",
        name: "DeepSeek V3.1",
        provider: wrappedModel(fireworks),
        tools: true,
        runtimePreset: "chat",
        extensions: [],
        cost: 1,
      },
      {
        id: "accounts/fireworks/models/deepseek-v3p2",
        name: "DeepSeek V3.2",
        features: [reasoning],
        provider: wrappedModel(fireworks),
        tools: true,
        runtimePreset: "chat",
        extensions: [],
        cost: 1,
      },
    ],
  },
  {
    id: "other",
    name: "Other",
    icon: "other",
    models: [
      {
        id: "accounts/fireworks/models/gpt-oss-120b",
        name: "gpt-oss-120b",
        features: [reasoning],
        provider: wrappedModel(fireworks),
        tools: true,
        runtimePreset: "chat",
        extensions: [],
        cost: 1,
      },
      {
        id: "accounts/fireworks/models/kimi-k2p5",
        name: "Kimi K2.5",
        features: [reasoning],
        provider: wrappedModel(fireworks),
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes],
        cost: 1,
      },
      {
        id: "accounts/fireworks/models/glm-5",
        name: "GLM 5",
        features: [reasoning],
        provider: wrappedModel(fireworks),
        tools: true,
        runtimePreset: "chat",
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
        runtimePreset: "chat",
        extensions: [],
        cost: 1,
      },
      {
        id: "sonar-pro",
        name: "Sonar Pro",
        features: [search],
        provider: wrappedModel(perplexity),
        tools: false,
        runtimePreset: "chat",
        extensions: [],
        cost: 3,
      },
    ],
  },
];

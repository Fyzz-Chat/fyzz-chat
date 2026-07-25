import "server-only";

import { hash } from "node:crypto";
import { type AnthropicProviderOptions, anthropic } from "@ai-sdk/anthropic";
import { type FireworksLanguageModelOptions, fireworks } from "@ai-sdk/fireworks";
import { type GoogleGenerativeAIProviderOptions, google } from "@ai-sdk/google";
import { type OpenAIResponsesProviderOptions, openai } from "@ai-sdk/openai";
import { perplexity } from "@ai-sdk/perplexity";
import type { LanguageModelV3 } from "@ai-sdk/provider";
import { type XaiResponsesProviderOptions, xai } from "@ai-sdk/xai";
import { type Tool, type ToolSet, wrapLanguageModel } from "ai";
import { anthropicCacheMiddleware } from "@/lib/backend/anthropic-cache-middleware";
import { messageFilterMiddleware } from "@/lib/backend/message-filter-middleware";
import { sanitizeMessagesForModel } from "@/lib/backend/message-sanitizer";
import type { CustomMetadata, CustomUIMessage } from "@/types/chat";
import {
  audioType,
  type Feature,
  imageTypes,
  type ModelCapabilities,
  type ModelRuntime,
  type Provider,
  type PublicModel,
  type PublicProvider,
  pdfType,
  plaintextType,
  type ReasoningEffort,
  type RuntimePreset,
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

const CHAT_INPUT_WINDOW_SIZE = -1; // -1 = unlimited; set to a positive integer to cap history

const EFFORT_BUDGET_TOKENS: Partial<Record<ReasoningEffort, number>> = {
  low: 1024,
  medium: 4096,
  high: 8192,
};

export function getProvidersPublic(): PublicProvider[] {
  return filterProviders().map((provider) => ({
    ...provider,
    models: provider.models.map(({ provider, ...rest }) => ({
      ...rest,
      features: withReasoningFeature(rest.features, rest.effortLevels),
    })),
  }));
}

function withReasoningFeature(
  features: Feature[] | undefined,
  effortLevels: readonly ReasoningEffort[] | undefined
): Feature[] | undefined {
  if (!effortLevels?.length) {
    return features;
  }
  if (features?.some((feature) => feature.icon === reasoning.icon)) {
    return features;
  }
  return [reasoning, ...(features ?? [])];
}

function resolveEffort(
  requested: ReasoningEffort | undefined,
  effortLevels: readonly ReasoningEffort[] | undefined
): ReasoningEffort | undefined {
  if (!effortLevels?.length) {
    return undefined;
  }
  if (requested && effortLevels.includes(requested)) {
    return requested;
  }
  return effortLevels.includes("medium")
    ? "medium"
    : effortLevels[Math.floor(effortLevels.length / 2)];
}

export function countModels() {
  return getProvidersPublic().flatMap((provider) => provider.models).length;
}

export function getModelPublic(modelId: string): PublicModel | undefined {
  return getProvidersPublic()
    .flatMap((provider) => provider.models)
    .find((model) => model.id === modelId);
}

export function getProviderIdForModel(
  modelId: string | undefined
): Provider["id"] | undefined {
  if (!modelId) {
    return undefined;
  }
  return filterProviders().find((provider) =>
    provider.models.some((model) => model.id === modelId)
  )?.id;
}

function wrapModel(
  model: LanguageModelV3,
  modelId: string,
  providerId: Provider["id"]
): LanguageModelV3 {
  const middleware = [messageFilterMiddleware(modelId)];
  if (providerId === "anthropic") {
    middleware.push(anthropicCacheMiddleware);
  }
  return wrapLanguageModel({ model, middleware });
}

export function getModelRuntime(
  modelId: string,
  reasoningEffort?: ReasoningEffort,
  userId?: string
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
    model: { id, provider, tools, runtimePreset, capabilities, extensions },
  } = runtimeModel;
  const selectedReasoningEffort = resolveEffort(
    reasoningEffort,
    runtimeModel.model.effortLevels
  );

  const rawModel = provider(id);

  return {
    modelId,
    model: wrapModel(rawModel, modelId, providerId),
    supportsTools: tools,
    runtimePreset,
    selectInputMessages: (messages) =>
      sanitizeMessagesForModel(resolveMessagesForRuntimePreset(messages, runtimePreset), {
        targetProviderId: providerId,
        supportsMediaType: (mediaType) =>
          (extensions ?? []).some((ext) =>
            mediaType.startsWith(ext.includes("/") ? ext : `${ext}/`)
          ),
        providerIdForModel: getProviderIdForModel,
      }),
    getProviderOptionsFromHistory: (messages) => {
      const previousResponseId = getPreviousResponseId(messages);
      return {
        anthropic: getAnthropicProviderOptions(modelId, selectedReasoningEffort),
        openai: getOpenaiProviderOptions(modelId, selectedReasoningEffort, userId),
        google: getGoogleProviderOptions(modelId, selectedReasoningEffort),
        xai: getXaiProviderOptions(
          runtimePreset,
          previousResponseId,
          selectedReasoningEffort
        ),
        fireworks: getFireworksProviderOptions(
          modelId,
          providerId,
          selectedReasoningEffort
        ),
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
    return CHAT_INPUT_WINDOW_SIZE === -1
      ? messages
      : messages.slice(-CHAT_INPUT_WINDOW_SIZE);
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
  reasoningEffort?: ReasoningEffort,
  userId?: string
): AnthropicProviderOptions {
  const isThinking = isThinkingModel(modelId, "anthropic") ?? false;

  return {
    effort: isThinking
      ? (reasoningEffort as AnthropicProviderOptions["effort"])
      : undefined,
    metadata: {
      userId: hash("sha256", userId ?? "no-user_id"),
    },
  };
}

export function getOpenaiProviderOptions(
  modelId: string,
  reasoningEffort?: ReasoningEffort,
  userId?: string
): OpenAIResponsesProviderOptions {
  const provider = azureConfigured ? "azure" : openaiConfiguredAzureNot ? "openai" : "";
  const isThinking = isThinkingModel(modelId, provider) ?? false;
  const hashedId = hash("sha256", userId ?? "no-user_id");

  return {
    reasoningEffort: isThinking
      ? ((reasoningEffort || "low") as OpenAIResponsesProviderOptions["reasoningEffort"])
      : undefined,
    reasoningSummary: isThinking ? "detailed" : undefined,
    user: hashedId,
    safetyIdentifier: hashedId,
    metadata: {
      userId: hashedId,
    },
    store: false,
  };
}

export function getGoogleProviderOptions(
  modelId: string,
  reasoningEffort?: ReasoningEffort
): GoogleGenerativeAIProviderOptions {
  const isThinking = isThinkingModel(modelId, "google") ?? false;

  return isThinking
    ? {
        thinkingConfig: {
          includeThoughts: true,
          ...(reasoningEffort
            ? {
                thinkingLevel: reasoningEffort as NonNullable<
                  GoogleGenerativeAIProviderOptions["thinkingConfig"]
                >["thinkingLevel"],
              }
            : {}),
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

  const effort = reasoningEffort === "none" ? undefined : reasoningEffort;

  return {
    store: true,
    previousResponseId,
    reasoningEffort: effort as XaiResponsesProviderOptions["reasoningEffort"],
  };
}

export function getFireworksProviderOptions(
  modelId: string,
  providerId: Provider["id"],
  reasoningEffort?: ReasoningEffort
): FireworksLanguageModelOptions {
  const fireworksBackedProvider =
    providerId === "llama" ||
    providerId === "deepseek" ||
    providerId === "qwen" ||
    providerId === "other";

  if (!fireworksBackedProvider) {
    return {};
  }

  const isThinking = isThinkingModel(modelId, providerId) ?? false;
  const budgetTokens = (reasoningEffort && EFFORT_BUDGET_TOKENS[reasoningEffort]) || 8192;

  return isThinking
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
        model: "gpt-image-2",
        outputFormat: "png",
        background: "auto",
        quality: "auto",
        size: "auto",
      }) as Tool;
    }

    if (search) {
      tools.web_search = openai.tools.webSearch() as Tool;
    }
  } else if (isAnthropicModel) {
    if (search) {
      tools.web_search = anthropic.tools.webSearch_20250305({ maxUses: 5 }) as Tool;
    }
    tools.code_execution = anthropic.tools.codeExecution_20260120() as Tool;
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

  return (model?.effortLevels?.length ?? 0) > 0;
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

const OPENAI_LEGACY_EFFORTS = [
  "low",
  "medium",
  "high",
] as const satisfies readonly ReasoningEffort[];
const ANTHROPIC_EFFORTS = [
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
] as const satisfies readonly ReasoningEffort[];
const GEMINI_EFFORTS = [
  "minimal",
  "low",
  "medium",
  "high",
] as const satisfies readonly ReasoningEffort[];
const GROK_EFFORTS = [
  "none",
  "low",
  "medium",
  "high",
] as const satisfies readonly ReasoningEffort[];
const FIREWORKS_EFFORTS = [
  "low",
  "medium",
  "high",
] as const satisfies readonly ReasoningEffort[];

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
        provider: openai,
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
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: imageTypes,
        cost: 2,
        capabilities: { supportsImageGeneration: true },
      },
      {
        id: "gpt-5-codex",
        name: "GPT-5 Codex",
        features: [coding],
        effortLevels: OPENAI_LEGACY_EFFORTS,
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: imageTypes,
        cost: 2,
        capabilities: { supportsCodeInterpreter: false },
      },
      {
        id: "gpt-5.1",
        name: "GPT-5.1",
        features: [search, coding, images],
        effortLevels: ["none", "low", "medium", "high"],
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 2,
        capabilities: { supportsImageGeneration: true },
      },
      {
        id: "gpt-5.1-codex",
        name: "GPT-5.1 Codex",
        features: [coding],
        effortLevels: OPENAI_LEGACY_EFFORTS,
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: imageTypes,
        cost: 2,
        capabilities: { supportsCodeInterpreter: false },
      },
      {
        id: "gpt-5.2",
        name: "GPT-5.2",
        features: [search, coding, images],
        effortLevels: ["none", "low", "medium", "high", "xhigh"],
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 3,
        capabilities: { supportsImageGeneration: true },
      },
      {
        id: "gpt-5.2-codex",
        name: "GPT-5.2 Codex",
        effortLevels: ["low", "medium", "high", "xhigh"],
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: imageTypes,
        cost: 3,
        capabilities: { supportsCodeInterpreter: false },
      },
      {
        id: "gpt-5.3-codex",
        name: "GPT-5.3 Codex",
        effortLevels: ["none", "low", "medium", "high", "xhigh"],
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: imageTypes,
        cost: 3,
        capabilities: { supportsCodeInterpreter: false },
      },
      {
        id: "gpt-5.4-nano",
        name: "GPT-5.4 nano",
        features: [search, coding, images],
        effortLevels: ["none", "low", "medium", "high", "xhigh"],
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 1,
        capabilities: { supportsImageGeneration: true },
      },
      {
        id: "gpt-5.4-mini",
        name: "GPT-5.4 mini",
        features: [search, coding, images],
        effortLevels: ["none", "low", "medium", "high", "xhigh"],
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 1,
        capabilities: { supportsImageGeneration: true },
      },
      {
        id: "gpt-5.4",
        name: "GPT-5.4",
        features: [search, coding, images],
        effortLevels: ["none", "low", "medium", "high", "xhigh"],
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 3,
        capabilities: { supportsImageGeneration: true },
      },
      {
        id: "gpt-5.5",
        name: "GPT-5.5",
        features: [search, coding, images],
        effortLevels: ["none", "low", "medium", "high", "xhigh"],
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 6,
        capabilities: { supportsImageGeneration: true },
      },
      {
        id: "gpt-5.6-sol",
        name: "GPT-5.6 Sol",
        features: [search, coding, images],
        effortLevels: ["none", "low", "medium", "high", "xhigh"],
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 6,
        capabilities: { supportsImageGeneration: true },
      },
      {
        id: "gpt-5.6-terra",
        name: "GPT-5.6 Terra",
        features: [search, coding, images],
        effortLevels: ["none", "low", "medium", "high", "xhigh"],
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 3,
        capabilities: { supportsImageGeneration: true },
      },
      {
        id: "gpt-5.6-luna",
        name: "GPT-5.6 Luna",
        features: [search, coding, images],
        effortLevels: ["none", "low", "medium", "high", "xhigh"],
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 2,
        capabilities: { supportsImageGeneration: true },
      },
      {
        id: "o3-mini",
        name: "o3-mini",
        effortLevels: OPENAI_LEGACY_EFFORTS,
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: [],
        cost: 1,
        capabilities: { supportsCodeInterpreter: false },
      },
      {
        id: "o4-mini",
        name: "o4-mini",
        effortLevels: OPENAI_LEGACY_EFFORTS,
        provider: openai,
        tools: true,
        runtimePreset: "chat",
        extensions: imageTypes,
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
        id: "claude-haiku-4-5-20251001",
        name: "Claude Haiku 4.5",
        features: [search],
        provider: anthropic,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 2,
      },
      {
        id: "claude-sonnet-4-5",
        name: "Claude Sonnet 4.5",
        features: [search],
        provider: anthropic,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 4,
      },
      {
        id: "claude-sonnet-4-6",
        name: "Claude Sonnet 4.6",
        features: [search],
        effortLevels: ["low", "medium", "high", "max"],
        provider: anthropic,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 4,
      },
      {
        id: "claude-sonnet-5",
        name: "Claude Sonnet 5",
        features: [search],
        effortLevels: ["low", "medium", "high", "max"],
        provider: anthropic,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 4,
      },
      {
        id: "claude-opus-4-5",
        name: "Claude Opus 4.5",
        features: [search],
        effortLevels: ["low", "medium", "high"],
        provider: anthropic,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 6,
      },
      {
        id: "claude-opus-4-6",
        name: "Claude Opus 4.6",
        features: [search],
        effortLevels: ["low", "medium", "high", "max"],
        provider: anthropic,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 6,
      },
      {
        id: "claude-opus-4-7",
        name: "Claude Opus 4.7",
        features: [search],
        effortLevels: ANTHROPIC_EFFORTS,
        provider: anthropic,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 6,
      },
      {
        id: "claude-opus-4-8",
        name: "Claude Opus 4.8",
        features: [search],
        effortLevels: ANTHROPIC_EFFORTS,
        provider: anthropic,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 6,
      },
      {
        id: "claude-opus-5",
        name: "Claude Opus 5",
        features: [search],
        effortLevels: ANTHROPIC_EFFORTS,
        provider: anthropic,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 6,
      },
      {
        id: "claude-fable-5",
        name: "Claude Fable 5",
        features: [search],
        effortLevels: ANTHROPIC_EFFORTS,
        provider: anthropic,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 11,
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
        provider: google,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, ...audioType, videoType, ...plaintextType],
        cost: 1,
      },
      {
        id: "gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash Lite",
        features: [],
        provider: google,
        tools: false,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, ...audioType, videoType, ...plaintextType],
        cost: 1,
      },
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        features: [search],
        provider: google,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, ...audioType, videoType, ...plaintextType],
        cost: 2,
      },
      {
        id: "gemini-3-flash-preview",
        name: "Gemini 3 Flash",
        features: [search],
        effortLevels: GEMINI_EFFORTS,
        provider: google,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, ...audioType, videoType, ...plaintextType],
        cost: 1,
      },
      {
        id: "gemini-3.1-flash-lite",
        name: "Gemini 3.1 Flash Lite",
        features: [search],
        effortLevels: GEMINI_EFFORTS,
        provider: google,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, ...audioType, videoType, ...plaintextType],
        cost: 1,
      },
      {
        id: "gemini-3.1-pro-preview",
        name: "Gemini 3.1 Pro",
        features: [search],
        effortLevels: ["low", "medium", "high"],
        provider: google,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, ...audioType, videoType, ...plaintextType],
        cost: 4,
      },
      {
        id: "gemini-3.5-flash",
        name: "Gemini 3.5 Flash",
        features: [search],
        effortLevels: GEMINI_EFFORTS,
        provider: google,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, ...audioType, videoType, ...plaintextType],
        cost: 2,
      },
      {
        id: "gemini-3.6-flash",
        name: "Gemini 3.6 Flash",
        features: [search],
        effortLevels: GEMINI_EFFORTS,
        provider: google,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType, ...audioType, videoType, ...plaintextType],
        cost: 2,
      },
      {
        id: "gemini-2.5-flash-image",
        name: "Nano Banana",
        features: [images],
        provider: google,
        tools: false,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 1,
      },
      {
        id: "gemini-3.1-flash-image-preview",
        name: "Nano Banana 2",
        features: [images],
        provider: google,
        tools: false,
        runtimePreset: "chat",
        extensions: [...imageTypes, pdfType],
        cost: 1,
      },
      {
        id: "gemini-3-pro-image-preview",
        name: "Nano Banana Pro",
        features: [images],
        provider: google,
        tools: false,
        runtimePreset: "chat",
        extensions: [...imageTypes],
        cost: 5,
      },
      {
        id: "gemma-4-26b-a4b-it",
        name: "Gemma 4 26B A4B",
        provider: google,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes],
        cost: 1,
      },
      {
        id: "gemma-4-31b-it",
        name: "Gemma 4 31B",
        provider: google,
        tools: true,
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
        id: "grok-4.20-0309-reasoning",
        name: "Grok 4.20",
        features: [search],
        provider: xai.responses,
        tools: true,
        runtimePreset: "responses",
        extensions: [...imageTypes, videoType],
        cost: 1,
        capabilities: { supportsXaiSearchTools: true },
      },
      {
        id: "grok-4.3",
        name: "Grok 4.3",
        features: [search],
        effortLevels: GROK_EFFORTS,
        provider: xai.responses,
        tools: true,
        runtimePreset: "responses",
        extensions: [...imageTypes],
        cost: 1,
        capabilities: { supportsXaiSearchTools: true },
      },
      {
        id: "grok-4.5",
        name: "Grok 4.5",
        features: [search],
        effortLevels: GROK_EFFORTS,
        provider: xai.responses,
        tools: true,
        runtimePreset: "responses",
        extensions: [...imageTypes],
        cost: 2,
        capabilities: { supportsXaiSearchTools: true },
      },
      {
        id: "grok-build-0.1",
        name: "Grok Build 0.1",
        features: [reasoning, search],
        provider: xai.responses,
        tools: true,
        runtimePreset: "responses",
        extensions: [...imageTypes, pdfType],
        cost: 1,
        capabilities: { supportsXaiSearchTools: true },
      },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: "deepseek",
    models: [
      {
        id: "accounts/fireworks/models/deepseek-v4-pro",
        name: "DeepSeek V4 Pro",
        effortLevels: FIREWORKS_EFFORTS,
        provider: fireworks,
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
        id: "accounts/fireworks/models/kimi-k2p5",
        name: "Kimi K2.5",
        effortLevels: FIREWORKS_EFFORTS,
        provider: fireworks,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes],
        cost: 1,
      },
      {
        id: "accounts/fireworks/models/kimi-k2p6",
        name: "Kimi K2.6",
        effortLevels: FIREWORKS_EFFORTS,
        provider: fireworks,
        tools: true,
        runtimePreset: "chat",
        extensions: [...imageTypes],
        cost: 1,
      },
      {
        id: "accounts/fireworks/models/glm-5p1",
        name: "GLM 5.1",
        effortLevels: FIREWORKS_EFFORTS,
        provider: fireworks,
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
        provider: perplexity,
        tools: false,
        runtimePreset: "chat",
        extensions: [],
        cost: 1,
      },
      {
        id: "sonar-pro",
        name: "Sonar Pro",
        features: [search],
        provider: perplexity,
        tools: false,
        runtimePreset: "chat",
        extensions: [],
        cost: 3,
      },
    ],
  },
];

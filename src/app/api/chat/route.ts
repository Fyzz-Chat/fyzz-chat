import type { MCPClient } from "@ai-sdk/mcp";
import {
  convertToModelMessages,
  hasToolCall,
  type LanguageModelUsage,
  safeValidateUIMessages,
  smoothStream,
  streamText,
  type Tool,
} from "ai";
import { after, type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { updateConversationTitle } from "@/lib/actions/conversations";
import { CompositeAbortController } from "@/lib/backend/abort-controller";
import { mapMessageFilePartsForRead } from "@/lib/backend/message-mapper";
import {
  buildToolsForRuntime,
  fetchSystemPromptAddons,
} from "@/lib/backend/model-runtime";
import { getSystemPrompt } from "@/lib/backend/prompts/system-prompt";
import { getModelPublic, getModelRuntime } from "@/lib/backend/providers";
import { createReasoningTimer } from "@/lib/backend/reasoning-timer";
import {
  enforceHistoryWithinLimit,
  enforceTokenLimitForMessage,
  enforceTokenLimitForText,
} from "@/lib/backend/token-limits";
import {
  getUnsupportedFileTypes,
  hasInputPart,
  logDuration,
  streamSentence,
} from "@/lib/backend/utils";
import conf from "@/lib/config";
import {
  ensureMessageAppended,
  getOrCreateConversation,
  hasDefaultTitle,
} from "@/lib/dao/conversations";
import {
  deleteMessageChainAfterPersisted,
  ensureMessageSaved,
  ensureTokenUsageSaved,
  getMessages,
} from "@/lib/dao/messages";
import { getUserFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import { effectiveMaxModelCost, isModelGated } from "@/lib/model-gating";
import { closeMcpClients, McpClientInitError } from "@/lib/services/mcp";
import { type CustomUIMessage, metadataSchema } from "@/types/chat";
import { type ReasoningEffort, reasoningEfforts } from "@/types/provider";

export const maxDuration = 600;

const chatRequestEnvelopeSchema = z.object({
  id: z.string().min(1),
  model: z.string().min(1),
  messages: z.unknown(),
  trigger: z.enum(["submit-message", "regenerate-message"]).optional(),
  messageId: z.string().optional(),
  newContent: z.string().optional(),
  browse: z.boolean().default(false),
  temporaryChat: z.boolean().default(false),
  reasoningEffort: z.enum(reasoningEfforts).optional(),
  projectId: z.string().optional(),
});

async function validateRequestBody(body: unknown): Promise<
  | {
      success: true;
      data: {
        id: string;
        model: string;
        messages: CustomUIMessage[];
        trigger?: "submit-message" | "regenerate-message";
        messageId?: string;
        newContent?: string;
        browse: boolean;
        temporaryChat: boolean;
        reasoningEffort?: ReasoningEffort;
        projectId?: string;
      };
    }
  | {
      success: false;
      error: string;
      details: unknown;
    }
> {
  const parsedEnvelope = chatRequestEnvelopeSchema.safeParse(body);

  if (!parsedEnvelope.success) {
    return {
      success: false,
      error: "Invalid request body",
      details: parsedEnvelope.error.issues,
    };
  }

  const validatedMessages = await safeValidateUIMessages<CustomUIMessage>({
    messages: parsedEnvelope.data.messages,
    metadataSchema: metadataSchema.optional(),
  });

  if (!validatedMessages.success) {
    return {
      success: false,
      error: "Invalid request body",
      details: validatedMessages.error,
    };
  }

  return {
    success: true,
    data: {
      ...parsedEnvelope.data,
      messages: validatedMessages.data,
    },
  };
}

function createEmptyConversationResponse() {
  return new Response("Cannot send an empty message to a new conversation.", {
    status: 400,
  });
}

async function loadConversationMessages({
  id,
  userId,
  modelId,
  incomingMessages,
  newMessage,
  temporaryChat,
  projectId,
  start,
}: {
  id: string;
  userId: string;
  modelId: string;
  incomingMessages: CustomUIMessage[];
  newMessage: CustomUIMessage | undefined;
  temporaryChat: boolean;
  projectId?: string;
  start: number;
}): Promise<{
  messages?: CustomUIMessage[];
  project?: { id: string; name: string; description: string | null } | null;
  errorResponse?: Response;
}> {
  if (temporaryChat) {
    const mappedMessages = (incomingMessages || []).map((message: CustomUIMessage) =>
      mapMessageFilePartsForRead(userId, id, message)
    );

    if (mappedMessages.length === 0) {
      return { errorResponse: createEmptyConversationResponse() };
    }

    return { messages: mappedMessages };
  }

  const getOrCreate = await getOrCreateConversation(id, userId, modelId, projectId);

  if (getOrCreate.error) {
    return {
      errorResponse: new Response(getOrCreate.error, { status: 403 }),
    };
  }

  logDuration(start, "Conversation fetched or created");

  let existingMessages: CustomUIMessage[];

  if (newMessage && hasInputPart(newMessage)) {
    const [conversationMessages] = await Promise.all([
      getMessages(id),
      ensureMessageAppended(newMessage, id),
    ]);
    existingMessages = conversationMessages.messages.map((message) =>
      mapMessageFilePartsForRead(userId, id, message)
    );

    const isRegeneratedMessage = existingMessages.some((m) => m.id === newMessage.id);
    if (!isRegeneratedMessage) {
      existingMessages = [
        ...existingMessages,
        mapMessageFilePartsForRead(userId, id, newMessage),
      ];
    }
  } else {
    const conversationMessages = await getMessages(id);
    existingMessages = conversationMessages.messages.map((message) =>
      mapMessageFilePartsForRead(userId, id, message)
    );
  }

  if (existingMessages.length === 0) {
    return { errorResponse: createEmptyConversationResponse() };
  }

  return { messages: existingMessages, project: getOrCreate.conversation?.project };
}

async function loadToolsForRequest({
  runtime,
  user,
  browse,
  temporaryChat,
  projectId,
  conversationId,
  start,
}: {
  runtime: ReturnType<typeof getModelRuntime>;
  user: Awaited<ReturnType<typeof getUserFromSession>>;
  browse: boolean;
  temporaryChat: boolean;
  projectId?: string;
  conversationId?: string;
  start: number;
}): Promise<{
  tools: { [key: string]: Tool };
  mcpClients: MCPClient[];
  errorResponse?: NextResponse;
}> {
  if (!runtime.supportsTools || temporaryChat) {
    return { tools: {}, mcpClients: [] };
  }

  try {
    const toolsResult = await buildToolsForRuntime(
      user,
      browse,
      runtime,
      projectId,
      conversationId
    );
    logDuration(start, "Tools fetched");
    return toolsResult;
  } catch (error) {
    const prefix = "[Chat] Error fetching tools";
    const model = `Model: ${runtime.modelId}`;
    const errorMsg = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    logger.error(`${prefix}\n${model}\n${errorMsg}`);

    if (error instanceof McpClientInitError) {
      return {
        tools: {},
        mcpClients: [],
        errorResponse: new NextResponse(
          typeof error.cause === "string"
            ? error.cause
            : "MCP client initialization failed",
          { status: 502 }
        ),
      };
    }

    return { tools: {}, mcpClients: [] };
  }
}

function createMessageMetadataHandler({
  start,
  modelId,
  reasoning,
}: {
  start: number;
  modelId: string;
  reasoning: ReturnType<typeof createReasoningTimer>;
}) {
  return ({ part }: { part: { type: string; id?: string } }) => {
    if (part.type === "start") {
      logDuration(start, "Response started");

      return {
        model: modelId,
        content: "",
        createdAt: new Date(),
        reasoningDurations: [],
      };
    }

    if (part.type === "reasoning-start" && part.id) {
      reasoning.startBlock(part.id);
    }

    if (part.type === "reasoning-end" && part.id) {
      const finishedBlock = reasoning.finishBlock(part.id);
      if (finishedBlock) {
        return {
          model: modelId,
          content: "",
          createdAt: new Date(),
          reasoningDurations: reasoning.durations,
        };
      }
    }

    if (part.type === "finish") {
      return {
        model: modelId,
        content: "",
        createdAt: new Date(),
        reasoningDurations: reasoning.finish(),
      };
    }
  };
}

async function persistStreamResult({
  result,
  runtime,
  conversationId,
  messages,
  responseMessage,
  isAborted,
  userId,
}: {
  result: ReturnType<typeof streamText>;
  runtime: ReturnType<typeof getModelRuntime>;
  conversationId: string;
  messages: CustomUIMessage[];
  responseMessage: CustomUIMessage;
  isAborted: boolean;
  userId?: string;
}) {
  const response = await result.response;
  responseMessage.metadata = runtime.decorateAssistantMetadata({
    metadata: responseMessage.metadata,
    responseId: response.id,
  });

  const lastMessage = responseMessage;
  const lastUserMessage = messages.at(-2);

  if (lastUserMessage?.role !== "user") {
    logger.error({
      message: "Invalid message order detected before saving.",
      description:
        "The message preceding the assistant's response was not from a user. This indicates a corrupted history.",
      conversationId,
      lastUserMessageRole: lastUserMessage?.role,
      lastMessageRole: lastMessage?.role,
      historyLength: messages.length,
    });
  }

  let usage: LanguageModelUsage | undefined;

  if (!isAborted) {
    try {
      usage = await result.usage;
      logger.debug(JSON.stringify(usage));
    } catch (error) {
      const prefix = "[Chat] Error getting usage";
      const model = `Model: ${runtime.modelId}`;
      const errorMsg = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      logger.error(`${prefix}\n${model}\n${errorMsg}`);
    }
  }

  await ensureMessageSaved(lastMessage, conversationId, 0, usage?.outputTokens || 0);

  if (lastUserMessage) {
    await ensureTokenUsageSaved(lastUserMessage.id, usage?.inputTokens || 0, 0);
  }

  try {
    if (await hasDefaultTitle(conversationId)) {
      logger.debug(`Updating conversation title for ${conversationId}`);
      await updateConversationTitle(conversationId, messages, userId);
    }
  } catch (error) {
    const prefix = "[Chat] Error updating conversation title";
    const conversation = `Conversation: ${conversationId}`;
    const errorMsg = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    logger.error(`${prefix}\n${conversation}\n${errorMsg}`);
  }
}

export async function POST(req: NextRequest) {
  const start = performance.now();

  const [user, bodyResult] = await Promise.all([
    getUserFromSession(),
    req.json().then(
      (b) => ({ ok: true as const, body: b as unknown }),
      () => ({ ok: false as const })
    ),
  ]);
  logDuration(start, "User fetched");

  if (!bodyResult.ok) return new Response("Invalid JSON body", { status: 400 });

  const parsedRequest = await validateRequestBody(bodyResult.body);

  if (!parsedRequest.success) {
    logger.warn({
      message: "Invalid chat request payload.",
      errors: parsedRequest.details,
      userId: user.id,
    });
    return new Response(parsedRequest.error, { status: 400 });
  }

  const {
    id,
    model: modelId,
    trigger,
    messageId,
    newContent,
    browse,
    temporaryChat,
    messages,
    projectId,
  } = parsedRequest.data;
  const newMessage = messages.at(-1);
  const runtime = getModelRuntime(modelId, parsedRequest.data.reasoningEffort, user.id);
  const { model } = runtime;

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  const maxModelCost = effectiveMaxModelCost(user.subscription, conf.modelGatingEnabled);
  const requestedModel = getModelPublic(modelId);
  if (requestedModel && isModelGated(requestedModel.cost, maxModelCost)) {
    return new Response("This model isn't available on your plan.", { status: 403 });
  }

  if (newMessage?.role === "user") {
    const rejection = await enforceTokenLimitForMessage(newMessage, `${user.id}/${id}`);
    if (rejection) return rejection;
  }

  if (trigger === "regenerate-message" && newContent) {
    const rejection = enforceTokenLimitForText(newContent);
    if (rejection) return rejection;
  }

  if (!temporaryChat && trigger === "regenerate-message" && messageId) {
    try {
      await deleteMessageChainAfterPersisted(messageId, id, newContent);
    } catch (error) {
      logger.warn({
        message: "Failed to delete message chain for regeneration.",
        conversationId: id,
        messageId,
        error: error instanceof Error ? error.message : String(error),
      });
      return new Response("Failed to regenerate message.", { status: 400 });
    }
  }

  const [conversationState, toolsState, promptAddons] = await Promise.all([
    loadConversationMessages({
      id,
      userId: user.id,
      modelId,
      incomingMessages: messages,
      newMessage,
      temporaryChat,
      projectId,
      start,
    }),
    loadToolsForRequest({
      runtime,
      user,
      browse,
      temporaryChat,
      projectId,
      conversationId: id,
      start,
    }),
    fetchSystemPromptAddons({
      memoryEnabled: user.memoryEnabled,
      skillsEnabled: user.skillsEnabled,
      temporaryChat,
      userId: user.id,
      projectId,
    }),
  ]);

  if (conversationState.errorResponse) {
    return conversationState.errorResponse;
  }
  if (toolsState.errorResponse) {
    return toolsState.errorResponse;
  }

  const existingMessages = conversationState.messages || [];

  const historyRejection = await enforceHistoryWithinLimit(
    existingMessages,
    `${user.id}/${id}`
  );
  if (historyRejection) return historyRejection;

  const latestMessage = existingMessages.at(-1);
  if (latestMessage?.role === "user") {
    const unsupported = getUnsupportedFileTypes(latestMessage, modelId);
    if (unsupported.length > 0) {
      const types = unsupported.join(", ");
      const sentence = `The selected model doesn't support the following file types: ${types}. Please remove the unsupported files or switch to a model that supports them.`;
      const assistantMessageId = uuidv4();

      if (!temporaryChat) {
        await ensureMessageSaved(
          {
            id: assistantMessageId,
            role: "assistant",
            parts: [{ type: "text", text: sentence }],
            metadata: { createdAt: new Date(), model: modelId },
          },
          id,
          0,
          0
        );
      }

      return streamSentence(sentence, { messageId: assistantMessageId });
    }
  }

  const baseSystemPrompt = getSystemPrompt(conversationState.project);
  const extendedSystemPrompt = `${baseSystemPrompt}${promptAddons}`;
  const { tools, mcpClients } = toolsState;

  logDuration(start, "System prompt composed");

  const abortController = new CompositeAbortController(req.signal);
  abortController.abortIn(maxDuration - 5);

  const reasoning = createReasoningTimer();
  let conversationEnded = false;

  async function endConversation() {
    if (temporaryChat || conversationEnded) {
      return;
    }
    conversationEnded = true;

    await closeMcpClients(mcpClients);
    abortController.cancelAbort();

    logDuration(start, "Conversation ended");
  }

  logDuration(start, "Streaming started");

  const messagesForModel = runtime.selectInputMessages(existingMessages);

  const result = streamText({
    model,
    messages: await convertToModelMessages(messagesForModel),
    system: extendedSystemPrompt,
    stopWhen: [hasToolCall("generateImage")],
    experimental_transform: smoothStream({
      delayInMs: 10,
    }),
    tools,
    providerOptions: runtime.getProviderOptionsFromHistory(existingMessages),
    abortSignal: abortController.signal,
    onAbort: async () => {
      logger.info(`Stream aborted for user: ${user.id}`);
      await endConversation();
    },
    onStepFinish: async (result) => {
      if (0 < result.dynamicToolCalls?.length) {
        logger.debug("Dynamic tool call finished.");
      }
      if (0 < result.staticToolCalls?.length) {
        logger.debug("Static tool call finished.");
      }
    },
    onError: async (error) => {
      const prefix = "[Chat] Error while streaming";
      const model = `Model: ${runtime.modelId}`;
      const errorMsg = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      logger.error(`${prefix}\n${model}\n${errorMsg}`);
      await endConversation();
    },
  });

  logDuration(start, "Response time");

  result.consumeStream({
    onError: (error) => {
      const prefix = "[Chat] Error while consuming stream";
      const model = `Model: ${runtime.modelId}`;
      const errorMsg = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      logger.error(`${prefix}\n${model}\n${errorMsg}`);
      void endConversation();
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    sendSources: true,
    originalMessages: existingMessages,
    messageMetadata: createMessageMetadataHandler({ start, modelId, reasoning }),
    onError: (error) => {
      const prefix = "[Chat] Error while streaming";
      const model = `Model: ${runtime.modelId}`;
      const errorMsg = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      logger.error(`${prefix}\n${model}\n${errorMsg}`);
      return "An unexpected error occurred.";
    },
    generateMessageId: () => uuidv4(),
    onFinish: async ({ messages, responseMessage, isAborted }) => {
      after(async () => {
        if (temporaryChat) {
          return;
        }

        try {
          await persistStreamResult({
            result,
            runtime,
            conversationId: id,
            messages,
            responseMessage,
            isAborted,
            userId: user.id,
          });
        } finally {
          await endConversation();
        }
      });
    },
  });
}

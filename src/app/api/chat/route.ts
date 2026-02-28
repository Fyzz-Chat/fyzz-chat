import type { MCPClient } from "@ai-sdk/mcp";
import {
  convertToModelMessages,
  hasToolCall,
  type LanguageModelUsage,
  safeValidateUIMessages,
  smoothStream,
  stepCountIs,
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
  buildSystemPromptWithMemory,
  buildToolsForRuntime,
} from "@/lib/backend/model-runtime";
import systemPrompt from "@/lib/backend/prompts/system-prompt";
import { getModelRuntime } from "@/lib/backend/providers";
import { createReasoningTimer } from "@/lib/backend/reasoning-timer";
import { filterMessages, hasInputPart, logDuration } from "@/lib/backend/utils";
import {
  ensureMessageAppended,
  getOrCreateConversation,
  hasDefaultTitle,
} from "@/lib/dao/conversations";
import { ensureMessageSaved, ensureTokenUsageSaved } from "@/lib/dao/messages";
import { getUserFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import { closeMcpClients, McpClientInitError } from "@/lib/services/mcp";
import { caller } from "@/lib/trpc/server";
import { type CustomUIMessage, metadataSchema } from "@/types/chat";
import type { ReasoningEffort } from "@/types/provider";

export const maxDuration = 55;

const chatRequestEnvelopeSchema = z.object({
  id: z.string().min(1),
  model: z.string().min(1),
  messages: z.unknown(),
  browse: z.boolean().default(false),
  temporaryChat: z.boolean().default(false),
  reasoningEffort: z.enum(["low", "medium", "high"]).optional(),
});

async function validateRequestBody(body: unknown): Promise<
  | {
      success: true;
      data: {
        id: string;
        model: string;
        messages: CustomUIMessage[];
        browse: boolean;
        temporaryChat: boolean;
        reasoningEffort?: ReasoningEffort;
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
  start,
}: {
  id: string;
  userId: string;
  modelId: string;
  incomingMessages: CustomUIMessage[];
  newMessage: CustomUIMessage | undefined;
  temporaryChat: boolean;
  start: number;
}): Promise<{ messages?: CustomUIMessage[]; errorResponse?: Response }> {
  if (temporaryChat) {
    const mappedMessages = (incomingMessages || []).map((message: CustomUIMessage) =>
      mapMessageFilePartsForRead(userId, id, message)
    );

    if (mappedMessages.length === 0) {
      return { errorResponse: createEmptyConversationResponse() };
    }

    return { messages: mappedMessages };
  }

  const getOrCreate = await getOrCreateConversation(id, userId, modelId);

  if (getOrCreate.error) {
    return {
      errorResponse: new Response(getOrCreate.error, { status: 403 }),
    };
  }

  logDuration(start, "Conversation fetched or created");

  const conversationMessages = await caller.messages({ id });
  let existingMessages = conversationMessages.messages;
  const isRegeneratedMessage =
    newMessage !== undefined &&
    existingMessages.some((existingMessage) => existingMessage.id === newMessage.id);

  if (newMessage && hasInputPart(newMessage) && !isRegeneratedMessage) {
    await ensureMessageAppended(newMessage, id);

    const mappedMessage = mapMessageFilePartsForRead(userId, id, newMessage);
    existingMessages = [...existingMessages, mappedMessage];
  }

  if (existingMessages.length === 0) {
    return { errorResponse: createEmptyConversationResponse() };
  }

  return { messages: existingMessages };
}

async function loadToolsForRequest({
  runtime,
  user,
  browse,
  temporaryChat,
  start,
}: {
  runtime: ReturnType<typeof getModelRuntime>;
  user: Awaited<ReturnType<typeof getUserFromSession>>;
  browse: boolean;
  temporaryChat: boolean;
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
    const toolsResult = await buildToolsForRuntime(user, browse, runtime);
    logDuration(start, "Tools fetched");
    return toolsResult;
  } catch (error) {
    logger.error(error);

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
}: {
  result: ReturnType<typeof streamText>;
  runtime: ReturnType<typeof getModelRuntime>;
  conversationId: string;
  messages: CustomUIMessage[];
  responseMessage: CustomUIMessage;
  isAborted: boolean;
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
      logger.error(error);
    }
  }

  await ensureMessageSaved(lastMessage, conversationId, 0, usage?.outputTokens || 0);

  if (lastUserMessage) {
    await ensureTokenUsageSaved(lastUserMessage.id, usage?.inputTokens || 0, 0);
  }

  try {
    if (await hasDefaultTitle(conversationId)) {
      logger.debug(`Updating conversation title for ${conversationId}`);
      await updateConversationTitle(conversationId, messages);
    }
  } catch (error) {
    logger.error(error);
  }
}

export async function POST(req: NextRequest) {
  const start = performance.now();
  const user = await getUserFromSession();
  logDuration(start, "User fetched");

  let body: unknown;

  try {
    body = await req.json();
  } catch (_error) {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const parsedRequest = await validateRequestBody(body);

  if (!parsedRequest.success) {
    logger.warn({
      message: "Invalid chat request payload.",
      errors: parsedRequest.details,
      userId: user.id,
    });
    return new Response(parsedRequest.error, { status: 400 });
  }

  const { id, model: modelId, browse, temporaryChat, messages } = parsedRequest.data;
  const newMessage = messages.at(-1);
  const runtime = getModelRuntime(modelId, browse, parsedRequest.data.reasoningEffort);
  const { model } = runtime;

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  const conversationState = await loadConversationMessages({
    id,
    userId: user.id,
    modelId,
    incomingMessages: messages,
    newMessage,
    temporaryChat,
    start,
  });

  if (conversationState.errorResponse) {
    return conversationState.errorResponse;
  }

  const existingMessages = conversationState.messages || [];
  const filteredMessages = filterMessages(existingMessages, modelId);

  const toolsState = await loadToolsForRequest({
    runtime,
    user,
    browse,
    temporaryChat,
    start,
  });

  if (toolsState.errorResponse) {
    return toolsState.errorResponse;
  }
  const { tools, mcpClients } = toolsState;

  const extendedSystemPrompt = await buildSystemPromptWithMemory({
    baseSystemPrompt: systemPrompt,
    memoryEnabled: user.memoryEnabled,
    temporaryChat,
  });

  logDuration(start, "Memory prompt fetched");

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

  const messagesForModel = runtime.selectInputMessages(filteredMessages);

  const result = streamText({
    model,
    messages: await convertToModelMessages(messagesForModel),
    system: extendedSystemPrompt,
    stopWhen: [stepCountIs(5), hasToolCall("generateImage")],
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
      logger.error(
        (error as { error?: { message?: string } }).error?.message ?? "Unknown error"
      );
      await endConversation();
    },
  });

  logDuration(start, "Response time");

  result.consumeStream({
    onError: (error) => {
      logger.error(error instanceof Error ? error.message : "Unknown error");
      void endConversation();
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    sendSources: true,
    originalMessages: existingMessages,
    messageMetadata: createMessageMetadataHandler({ start, modelId, reasoning }),
    onError: (error) => {
      logger.error(error instanceof Error ? error.message : "Unknown error");
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
          });
        } finally {
          await endConversation();
        }
      });
    },
  });
}

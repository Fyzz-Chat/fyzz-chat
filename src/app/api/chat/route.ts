import type { MCPClient } from "@ai-sdk/mcp";
import {
  convertToModelMessages,
  hasToolCall,
  type LanguageModelUsage,
  smoothStream,
  stepCountIs,
  streamText,
  type Tool,
} from "ai";
import { after, type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { updateConversationTitle } from "@/lib/actions/conversations";
import { CompositeAbortController } from "@/lib/backend/abort-controller";
import {
  buildSystemPromptWithMemory,
  buildToolsForRuntime,
} from "@/lib/backend/model-runtime";
import systemPrompt from "@/lib/backend/prompts/system-prompt";
import { getModelRuntime } from "@/lib/backend/providers";
import { createReasoningTimer } from "@/lib/backend/reasoning-timer";
import {
  filterMessages,
  hasTextPart,
  logDuration,
  mapFileParts,
} from "@/lib/backend/utils";
import {
  appendMessageToConversation,
  getOrCreateConversation,
  hasDefaultTitle,
} from "@/lib/dao/conversations";
import { saveMessage, saveTokenUsage } from "@/lib/dao/messages";
import { getUserFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import { closeMcpClients, McpClientInitError } from "@/lib/services/mcp";
import { caller } from "@/lib/trpc/server";
import type { CustomUIMessage } from "@/types/chat";

export const maxDuration = 55;

export async function POST(req: NextRequest) {
  const start = performance.now();
  const user = await getUserFromSession();
  logDuration(start, "User fetched");

  const { id, messages, model: modelId, browse, temporaryChat } = await req.json();
  const newMessage: CustomUIMessage = messages.at(-1);
  const runtime = getModelRuntime(modelId, browse);
  const { model, supportsTools } = runtime;

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  let existingMessages: CustomUIMessage[] = [];

  if (temporaryChat) {
    existingMessages = (messages || []).map((message: CustomUIMessage) =>
      mapFileParts(message, user.id, id)
    );

    if (existingMessages.length === 0) {
      return new Response("Cannot send an empty message to a new conversation.", {
        status: 400,
      });
    }
  } else {
    const getOrCreate = await getOrCreateConversation(id, user.id, modelId);

    if (getOrCreate.error) {
      return new Response(getOrCreate.error, { status: 403 });
    }

    logDuration(start, "Conversation fetched or created");

    const conversationMessages = await caller.messages({ id });
    existingMessages = conversationMessages.messages;
    const isRegeneratedMessage = existingMessages.find((m) => m.id === newMessage.id);

    if (newMessage && hasTextPart(newMessage) && !isRegeneratedMessage) {
      await appendMessageToConversation(newMessage, id);

      const mappedMessage = mapFileParts(newMessage, user.id, id);
      existingMessages = [...existingMessages, mappedMessage];
    } else if (existingMessages.length === 0) {
      return new Response("Cannot send an empty message to a new conversation.", {
        status: 400,
      });
    }
  }

  const filteredMessages = filterMessages(existingMessages, modelId);

  let tools: { [key: string]: Tool } = {};
  let mcpClients: MCPClient[] = [];

  if (supportsTools && !temporaryChat) {
    try {
      const toolsResult = await buildToolsForRuntime(user, browse, runtime);
      tools = toolsResult.tools;
      mcpClients = toolsResult.mcpClients;

      logDuration(start, "Tools fetched");
    } catch (error) {
      logger.error(error);

      if (error instanceof McpClientInitError) {
        return new NextResponse(
          typeof error.cause === "string"
            ? error.cause
            : "MCP client initialization failed",
          { status: 502 }
        );
      }
    }
  }

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
    messageMetadata: ({ part }) => {
      if (part.type === "start") {
        logDuration(start, "Response started");

        return {
          model: modelId,
          content: "",
          createdAt: new Date(),
          reasoningDurations: [],
        };
      }

      if (part.type === "reasoning-start") {
        reasoning.startBlock(part.id);
      }

      if (part.type === "reasoning-end") {
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
    },
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
          const response = await result.response;
          responseMessage.metadata = runtime.decorateAssistantMetadata({
            metadata: responseMessage.metadata,
            responseId: response.id,
          });

          if (await hasDefaultTitle(id)) {
            logger.debug(`Updating conversation title for ${id}`);
            await updateConversationTitle(id, messages);
          }

          const lastMessage = responseMessage;
          const lastUserMessage = messages.at(-2);

          if (lastUserMessage?.role !== "user") {
            logger.error({
              message: "Invalid message order detected before saving.",
              description:
                "The message preceding the assistant's response was not from a user. This indicates a corrupted history.",
              conversationId: id,
              lastUserMessageRole: lastUserMessage?.role,
              lastMessageRole: lastMessage?.role,
              historyLength: messages.length,
            });
          }

          let usage: LanguageModelUsage | undefined;

          if (!isAborted) {
            usage = await result.usage;
            logger.debug(JSON.stringify(usage));
          }

          if (lastUserMessage) {
            await saveTokenUsage(lastUserMessage.id, usage?.inputTokens || 0, 0);
          }

          await saveMessage(lastMessage, id, 0, usage?.outputTokens || 0);
        } finally {
          await endConversation();
        }
      });
    },
  });
}

import { updateConversationTitle } from "@/lib/actions/conversations";
import { getFileUrlSigned } from "@/lib/aws/s3";
import { CompositeAbortController } from "@/lib/backend/abort-controller";
import { getMemoryPrompt } from "@/lib/backend/prompts/memory-prompt";
import systemPrompt from "@/lib/backend/prompts/system-prompt";
import {
  getAnthropicProviderOptions,
  getGoogleProviderOptions,
  getModel,
  getOpenaiProviderOptions,
  getProviderTools,
} from "@/lib/backend/providers";
import { memoryTool } from "@/lib/backend/tools/memory";
import { readUrlTool } from "@/lib/backend/tools/read-url";
import { filterMessages, logDuration } from "@/lib/backend/utils";
import {
  appendMessageToConversation,
  lockConversation,
  unlockConversation,
} from "@/lib/dao/conversations";
import { saveMessage, saveTokenUsage } from "@/lib/dao/messages";
import { type SessionUser, getUserFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import {
  McpClientInitError,
  closeMcpClients,
  getMcpClients,
  getMcpTools,
} from "@/lib/services/mcp";
import { caller } from "@/lib/trpc/server";
import type { CustomUIMessage } from "@/types/chat";
import type { experimental_MCPClient as McpClient } from "@ai-sdk/mcp";
import {
  type LanguageModelUsage,
  type Tool,
  convertToModelMessages,
  hasToolCall,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { type NextRequest, NextResponse, after } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 55;

export async function POST(req: NextRequest) {
  const start = performance.now();
  const user = await getUserFromSession();
  logDuration(start, "User fetched");

  const { id, messages, model: modelId, browse, temporaryChat } = await req.json();
  const newMessage: CustomUIMessage = messages?.[messages.length - 1];
  const { model, supportsTools } = getModel(modelId, browse);

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  let existingConversation: any;
  let existingMessages: CustomUIMessage[] = [];

  if (temporaryChat) {
    existingMessages = (messages || []).map((message: CustomUIMessage) =>
      mapFileParts(message, user.id, id)
    );

    if (existingMessages.length === 0) {
      throw new Error("Cannot send an empty message to a new conversation.");
    }
  } else {
    const [conversation, conversationMessages] = await Promise.all([
      caller.conversation({ id }),
      caller.messages({ id }),
    ]);

    existingConversation = conversation;
    existingMessages = conversationMessages.messages;

    const lock = await acquireConversationLock(id);

    if (!lock) {
      return new Response("conversation_locked", { status: 400 });
    }

    if (newMessage && hasTextPart(newMessage)) {
      await appendMessageToConversation(newMessage, id);

      const mappedMessage = mapFileParts(newMessage, user.id, id);
      existingMessages = [...existingMessages, mappedMessage];
    } else if (existingMessages.length === 0) {
      await unlockConversation(id);
      throw new Error("Cannot send an empty message to a new conversation.");
    }
  }

  const filteredMessages = filterMessages(existingMessages, modelId);

  let tools: { [key: string]: Tool } = {};
  let mcpClients: McpClient[] = [];

  if (supportsTools && !temporaryChat) {
    try {
      const toolsResult = await getTools(user, modelId, browse);
      tools = toolsResult.tools;
      mcpClients = toolsResult.mcpClients;
    } catch (error: any) {
      logger.error(error);

      if (error instanceof McpClientInitError) {
        return new NextResponse(error.cause as string, { status: 502 });
      }
    }
  }

  let memoryPrompt = "";

  if (user.memoryEnabled && !temporaryChat) {
    memoryPrompt = await getMemoryPrompt();
  }

  const extendedSystemPrompt = `${systemPrompt}${memoryPrompt}`;

  const abortController = new CompositeAbortController(req.signal);
  abortController.abortIn(maxDuration - 5);

  const reasoning = createReasoningTimer();

  async function endConversation() {
    if (temporaryChat) {
      return;
    }

    await unlockConversation(id);
    await closeMcpClients(mcpClients);
    abortController.cancelAbort();
  }

  const result = streamText({
    model,
    messages: convertToModelMessages(filteredMessages),
    system: extendedSystemPrompt,
    stopWhen: [stepCountIs(5), hasToolCall("generateImage")],
    experimental_transform: smoothStream({
      delayInMs: 10,
    }),
    tools,
    providerOptions: {
      anthropic: getAnthropicProviderOptions(modelId),
      openai: getOpenaiProviderOptions(modelId),
      google: getGoogleProviderOptions(modelId),
    },
    abortSignal: abortController.signal,
    onAbort: async () => {
      logger.info(`Stream aborted for user: ${user.id}`);
      await endConversation();
    },
    onChunk: async ({ chunk }) => {
      if (chunk.type === "reasoning-delta") {
        reasoning.onDelta(chunk.id);
      }
    },
    onError: async (error: any) => {
      logger.error(error.error.message);
      await endConversation();
    },
  });

  logDuration(start, "Response time");

  result.consumeStream({
    onError: async (error: any) => {
      logger.error(error.message);
      await endConversation();
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    sendSources: true,
    originalMessages: existingMessages,
    messageMetadata: ({ part }) => {
      if (part.type === "start") {
        return {
          model: modelId,
          content: "",
          createdAt: new Date(),
          reasoningDurations: [],
        };
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
    onError: (error: any) => JSON.stringify(error),
    generateMessageId: () => uuidv4(),
    onFinish: async ({ messages, responseMessage, isAborted }) => {
      after(async () => {
        const reasoningDurations = reasoning.finish();
        if (temporaryChat) {
          return;
        }

        try {
          if (existingConversation?.title === "New Chat") {
            await updateConversationTitle(id, messages);
          }

          const lastMessage = responseMessage as CustomUIMessage;
          const lastUserMessage = messages[messages.length - 2];

          if (!lastUserMessage || lastUserMessage.role !== "user") {
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

          await saveTokenUsage(lastUserMessage.id, usage?.inputTokens || 0, 0);

          // const messageWithFiles = await uploadMedia(user.id, id, lastMessage);
          // File data URLs are not supported yet in Gemini Image Gen models
          const messageWithFiles = lastMessage;

          await saveMessage(
            messageWithFiles,
            reasoningDurations,
            id,
            modelId,
            0,
            usage?.outputTokens || 0
          );
        } finally {
          await endConversation();
        }
      });
    },
  });
}

async function acquireConversationLock(conversationId: string): Promise<boolean> {
  for (let i = 0; i < 15; i++) {
    const locked = await lockConversation(conversationId);
    if (locked) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  logger.error("Failed to acquire conversation lock");
  return false;
}

async function getTools(
  user: SessionUser,
  modelId: string,
  search: boolean
): Promise<{ tools: { [key: string]: Tool }; mcpClients: McpClient[] }> {
  const tools: { [key: string]: Tool } = {};

  // if (openaiConfigured) {
  //   tools.generateImage = await generateImageTool(conversationId);
  // }

  if (user.memoryEnabled) {
    tools.memory = memoryTool;
  }

  tools.readUrl = readUrlTool;
  // Not working in production yet
  // tools.readYoutube = readYoutubeTool;

  const providerTools = getProviderTools(modelId, search);
  Object.assign(tools, providerTools);

  const mcpClients = await getMcpClients();

  if (mcpClients) {
    const mcpTools = await getMcpTools(mcpClients);
    Object.assign(tools, mcpTools);
  }

  return { tools, mcpClients };
}

function hasTextPart(message: CustomUIMessage) {
  return message.parts?.some((part) => part.type === "text" && part.text);
}

function mapFileParts(
  message: CustomUIMessage,
  userId: string,
  conversationId: string
): CustomUIMessage {
  return {
    ...message,
    parts: message.parts?.map((part: CustomUIMessage["parts"][number]) => {
      if (part.type === "file") {
        return {
          ...part,
          url: getFileUrlSigned(`${userId}/${conversationId}`, part.url),
        };
      }
      return part;
    }),
  };
}

function createReasoningTimer() {
  let currentId: string | null = null;
  let startMs = 0;
  const durations: { id: string; ms: number }[] = [];

  function onDelta(id?: string) {
    if (!id) return;
    if (currentId === null) {
      currentId = id;
      startMs = performance.now();
      return;
    }
    if (id !== currentId) {
      const elapsed = Math.round(performance.now() - startMs);
      durations.push({ id: currentId, ms: elapsed });
      logger.debug(`Reasoning step ${currentId} took ${elapsed}ms`);
      currentId = id;
      startMs = performance.now();
    }
  }

  function finish() {
    if (currentId !== null) {
      const elapsed = Math.round(performance.now() - startMs);
      durations.push({ id: currentId, ms: elapsed });
      logger.debug(`Reasoning step ${currentId} took ${elapsed}ms`);
      logger.debug(`Reasoning durations: ${JSON.stringify(durations)}`);
      currentId = null;
    }
    return durations;
  }

  return { onDelta, finish, durations };
}

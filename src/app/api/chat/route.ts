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
  getTemperature,
  openaiConfigured,
} from "@/lib/backend/providers";
import { generateImageTool } from "@/lib/backend/tools/generate-image";
import { memoryTool } from "@/lib/backend/tools/memory";
import { filterMessages, logDuration } from "@/lib/backend/utils";
import {
  appendMessageToConversation,
  lockConversation,
  unlockConversation,
} from "@/lib/dao/conversations";
import { saveMessage, saveTokenUsage } from "@/lib/dao/messages";
import { type SessionUser, getUserFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import { closeMcpClients, getMcpClients, getMcpTools } from "@/lib/services/mcp";
import { caller } from "@/lib/trpc/server";
import type { CustomUIMessage } from "@/types/chat";
import {
  type experimental_MCPClient as McpClient,
  type Tool,
  convertToModelMessages,
  hasToolCall,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

const MAX_DURATION = 55;

export const maxDuration = MAX_DURATION;

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
    const toolsResult = await getTools(user, id);
    tools = toolsResult.tools;
    mcpClients = toolsResult.mcpClients;
  }

  let memoryPrompt = "";

  if (user.memoryEnabled && !temporaryChat) {
    memoryPrompt = await getMemoryPrompt();
  }

  const extendedSystemPrompt = `${systemPrompt}${memoryPrompt}`;

  const abortController = new CompositeAbortController(req.signal);
  abortController.abortIn(MAX_DURATION - 5);

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
    temperature: getTemperature(modelId),
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
      logger.info("Stream aborted");
      await endConversation();
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
    onError: (error: any) => JSON.stringify(error),
    generateMessageId: () => uuidv4(),
    onFinish: async ({ messages, responseMessage }) => {
      if (temporaryChat) {
        return;
      }

      try {
        if (existingConversation?.title === "New Chat") {
          updateConversationTitle(id, messages);
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

        const sources = await result.sources;
        addSourcesToMessage(lastMessage, sources);

        const usage = await result.usage;
        logger.debug(JSON.stringify(usage));

        await saveTokenUsage(lastUserMessage.id, usage.inputTokens || 0, 0);
        await saveMessage(lastMessage, id, modelId, 0, usage.outputTokens || 0);
      } finally {
        await endConversation();
      }
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
  conversationId: string
): Promise<{ tools: { [key: string]: Tool }; mcpClients: McpClient[] }> {
  const tools: { [key: string]: Tool } = {};

  if (openaiConfigured) {
    tools.generateImage = await generateImageTool(conversationId);
  }

  if (user.memoryEnabled) {
    tools.memory = memoryTool;
  }

  const mcpClients = await getMcpClients();

  if (mcpClients) {
    const mcpTools = await getMcpTools(mcpClients);
    Object.assign(tools, mcpTools);
  }

  return { tools, mcpClients };
}

function addSourcesToMessage(message: CustomUIMessage, sources: any) {
  sources.forEach((source: any) => {
    message.parts?.push({
      type: "source-url",
      url: source.url,
      sourceId: source.id,
    });
  });
}

function hasTextPart(message: CustomUIMessage) {
  return message.parts?.some((part) => part.type === "text" && part.text);
}

function mapFileParts(
  message: CustomUIMessage,
  userId: number,
  conversationId: string
): CustomUIMessage {
  return {
    ...message,
    parts: message.parts?.map((part: CustomUIMessage["parts"][number]) => {
      if (part.type === "file") {
        return {
          ...part,
          url: getFileUrlSigned(`${userId}/${conversationId}/${part.url}`),
        };
      }
      return part;
    }),
  };
}

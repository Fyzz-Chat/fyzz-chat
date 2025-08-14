import { updateConversationTitle } from "@/lib/actions/conversations";
import { getFileUrlSigned } from "@/lib/aws/s3";
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
import { getUserFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import { closeMcpClients, getMcpClients, getMcpTools } from "@/lib/services/mcp";
import { caller } from "@/lib/trpc/server";
import type { CustomUIMessage } from "@/types/chat";
import {
  type Tool,
  convertToModelMessages,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 55;

export async function POST(req: NextRequest) {
  const start = performance.now();
  const user = await getUserFromSession();
  logDuration(start, "User fetched");

  const { id, messages, model: modelId, browse } = await req.json();
  const newMessage: CustomUIMessage = messages?.[messages.length - 1];
  const { model, supportsTools } = getModel(modelId, browse);

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  const [existingConversation, conversationMessages] = await Promise.all([
    caller.conversation({ id }),
    caller.messages({ id }),
  ]);

  let existingMessages: CustomUIMessage[] = conversationMessages.messages;

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

  const filteredMessages = filterMessages(existingMessages, modelId);

  const tools: { [key: string]: Tool } = {};

  if (openaiConfigured) {
    tools.generateImage = await generateImageTool(id);
  }

  let memoryPrompt = "";

  if (user.memoryEnabled) {
    memoryPrompt = await getMemoryPrompt();

    if (supportsTools) {
      tools.memory = memoryTool;
    }
  }

  const extendedSystemPrompt = `${systemPrompt}${memoryPrompt}`;

  const mcpClients = await getMcpClients();

  if (mcpClients && supportsTools) {
    const mcpTools = await getMcpTools(mcpClients);
    Object.assign(tools, mcpTools);
  }

  const result = streamText({
    model,
    messages: convertToModelMessages(filteredMessages),
    system: extendedSystemPrompt,
    stopWhen: stepCountIs(5),
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
    abortSignal: req.signal,
    onAbort: async () => {
      logger.info("Stream aborted");
      await unlockConversation(id);
      await closeMcpClients(mcpClients);
    },
    onError: async (error: any) => {
      logger.error(error.error.message);
      await unlockConversation(id);
      await closeMcpClients(mcpClients);
    },
  });

  logDuration(start, "Response time");

  result.consumeStream({
    onError: async (error: any) => {
      logger.error(error.message);
      await unlockConversation(id);
      await closeMcpClients(mcpClients);
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    sendSources: true,
    originalMessages: existingMessages,
    onError: (error: any) => JSON.stringify(error),
    generateMessageId: () => uuidv4(),
    onFinish: async ({ messages, responseMessage }) => {
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
        await unlockConversation(id);
        await closeMcpClients(mcpClients);
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

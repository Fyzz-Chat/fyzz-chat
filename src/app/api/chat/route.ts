import { updateConversationTitle } from "@/lib/actions/conversations";
import { awsConfigured, getFileUrlSigned } from "@/lib/aws/s3";
import { getMemoryPrompt } from "@/lib/backend/prompts/memory-prompt";
import systemPrompt from "@/lib/backend/prompts/system-prompt";
import {
  getAnthropicProviderOptions,
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
import {
  type Attachment,
  type Tool,
  type UIMessage,
  appendClientMessage,
  appendResponseMessages,
  smoothStream,
  streamText,
} from "ai";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 55;

export async function POST(req: NextRequest) {
  const start = performance.now();
  const user = await getUserFromSession();
  logDuration(start, "User fetched");

  const { id, message, model: modelId, browse } = await req.json();
  const { model, supportsTools } = getModel(modelId, browse);

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  const [existingConversation, conversationMessages] = await Promise.all([
    caller.conversation({ id }),
    caller.messages({ id }),
  ]);

  let existingMessages: UIMessage[] = conversationMessages.messages;

  const { experimental_attachments, ...textMessage } = message;

  const lock = await acquireConversationLock(id);

  if (!lock) {
    return new Response("conversation_locked", { status: 400 });
  }

  if (experimental_attachments) {
    try {
      if (awsConfigured) {
        const key = `${user.id}/${id}`;
        // Files saved in the database must be the keys
        textMessage.files = experimental_attachments.map((attachment: Attachment) => ({
          ...attachment,
          url: `${key}/${attachment.url}`,
        }));

        // Files sent to the model must be the signed URLs
        message.experimental_attachments = experimental_attachments.map(
          (attachment: Attachment) => ({
            ...attachment,
            url: getFileUrlSigned(`${key}/${attachment.url}`),
          })
        );
      } else {
        // If AWS is not configured, we simply save the files in the database
        textMessage.files = experimental_attachments;
      }
    } catch (error) {
      logger.error(error);
      await unlockConversation(id);
      return new Response("file_too_large", { status: 400 });
    }
  }

  let messages = existingMessages;

  if (hasTextPart(message)) {
    await appendMessageToConversation(textMessage, id);

    messages = appendClientMessage({
      messages: existingMessages,
      message,
    }) as UIMessage[];
  } else if (existingMessages.length === 0) {
    await unlockConversation(id);
    throw new Error("Cannot send an empty message to a new conversation.");
  }

  const filteredMessages = filterMessages(messages, modelId);

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
    messages: filteredMessages,
    system: extendedSystemPrompt,
    maxSteps: 3,
    temperature: getTemperature(modelId),
    experimental_transform: smoothStream({
      delayInMs: 10,
    }),
    tools,
    experimental_generateMessageId: () => uuidv4(),
    providerOptions: {
      anthropic: getAnthropicProviderOptions(modelId),
      openai: getOpenaiProviderOptions(modelId),
    },
    abortSignal: req.signal,
    onFinish: async ({ response }) => {
      try {
        const updatedMessages = appendResponseMessages({
          messages,
          responseMessages: response.messages,
        }) as UIMessage[];

        if (existingConversation?.title === "New Chat") {
          await updateConversationTitle(id, updatedMessages);
        }

        const lastMessage = updatedMessages[updatedMessages.length - 1];
        const lastUserMessage = updatedMessages[updatedMessages.length - 2];

        if (!lastUserMessage || lastUserMessage.role !== "user") {
          logger.error({
            message: "Invalid message order detected before saving.",
            description:
              "The message preceding the assistant's response was not from a user. This indicates a corrupted history.",
            conversationId: id,
            lastUserMessageRole: lastUserMessage?.role,
            lastMessageRole: lastMessage?.role,
            historyLength: updatedMessages.length,
          });
        }

        const sources = await result.sources;
        addSourcesToMessage(lastMessage, sources);

        const usage = await result.usage;
        logger.debug(JSON.stringify(usage));

        await saveTokenUsage(lastUserMessage.id, usage.promptTokens || 0, 0);
        await saveMessage(lastMessage, id, modelId, 0, usage.completionTokens || 0);
      } finally {
        await unlockConversation(id);
        await closeMcpClients(mcpClients);
      }
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

  return result.toDataStreamResponse({
    sendReasoning: true,
    sendSources: true,
    getErrorMessage: (error: any) => JSON.stringify(error),
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
  return false;
}

function addSourcesToMessage(message: UIMessage, sources: any) {
  sources.forEach((source: any) => {
    message.parts?.push({
      type: "source",
      source,
    });
  });
}

function hasTextPart(message: UIMessage) {
  return message.parts?.some((part) => part.type === "text" && part.text);
}

import type { MCPClient } from "@ai-sdk/mcp";
import type { Tool } from "ai";
import { getMemoryPrompt } from "@/lib/backend/prompts/memory-prompt";
import { memoryTool } from "@/lib/backend/tools/memory";
import { readUrlTool } from "@/lib/backend/tools/read-url";
import type { SessionUser } from "@/lib/dao/users";
import { getMcpClients, getMcpTools } from "@/lib/services/mcp";
import type { CustomUIMessage } from "@/types/chat";
import type { ConversationState, ModelRuntime } from "@/types/provider";

export function getPreviousResponseId(messages: CustomUIMessage[]): string | undefined {
  return [...messages]
    .reverse()
    .find(
      (message) =>
        message.role === "assistant" &&
        typeof message.metadata?.providerResponseId === "string"
    )?.metadata?.providerResponseId;
}

export function resolveMessagesForRuntime(
  messages: CustomUIMessage[],
  conversationState: ConversationState
) {
  if (conversationState !== "provider-response-id") {
    return messages;
  }

  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  return latestUserMessage ? [latestUserMessage] : messages.slice(-1);
}

export async function buildToolsForRuntime(
  user: SessionUser,
  search: boolean,
  runtime: ModelRuntime
): Promise<{ tools: { [key: string]: Tool }; mcpClients: MCPClient[] }> {
  const providerTools = runtime.getProviderTools(search);

  if (runtime.conversationState === "provider-response-id") {
    return { tools: providerTools, mcpClients: [] };
  }

  const tools: { [key: string]: Tool } = {};

  if (user.memoryEnabled) {
    tools.memory = memoryTool;
  }

  if (search) {
    tools.readUrl = readUrlTool;
  }

  Object.assign(tools, providerTools);

  const mcpClients = await getMcpClients();

  if (mcpClients) {
    const mcpTools = await getMcpTools(mcpClients);
    Object.assign(tools, mcpTools);
  }

  return { tools, mcpClients };
}

export async function buildSystemPromptWithMemory({
  baseSystemPrompt,
  memoryEnabled,
  temporaryChat,
}: {
  baseSystemPrompt: string;
  memoryEnabled: boolean;
  temporaryChat: boolean;
}) {
  if (!memoryEnabled || temporaryChat) {
    return baseSystemPrompt;
  }

  const memoryPrompt = await getMemoryPrompt();
  return `${baseSystemPrompt}${memoryPrompt}`;
}

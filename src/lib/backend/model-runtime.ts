import type { MCPClient } from "@ai-sdk/mcp";
import type { Tool } from "ai";
import { getMemoryPrompt } from "@/lib/backend/prompts/memory-prompt";
import { memoryTool } from "@/lib/backend/tools/memory";
import { readUrlTool } from "@/lib/backend/tools/read-url";
import type { SessionUser } from "@/lib/dao/users";
import { getMcpClients, getMcpTools } from "@/lib/services/mcp";
import type { ModelRuntime } from "@/types/provider";

export async function buildToolsForRuntime(
  user: SessionUser,
  search: boolean,
  runtime: ModelRuntime
): Promise<{ tools: { [key: string]: Tool }; mcpClients: MCPClient[] }> {
  const providerTools = runtime.getProviderTools(search);

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

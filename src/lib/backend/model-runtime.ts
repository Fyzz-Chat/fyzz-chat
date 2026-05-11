import type { MCPClient } from "@ai-sdk/mcp";
import type { Tool } from "ai";
import { getAgentMemoryPrompt } from "@/lib/backend/prompts/agent-memory-prompt";
import { getSkillPrompt } from "@/lib/backend/prompts/skill-prompt";
import { createAgentMemoryTools } from "@/lib/backend/tools/agent-memory";
import { readUrlTool } from "@/lib/backend/tools/read-url";
import { createActivateSkillTool } from "@/lib/backend/tools/skills";
import { countEnabledSkillsInScope } from "@/lib/dao/skills";
import type { SessionUser } from "@/lib/dao/users";
import { getMcpClients, getMcpTools } from "@/lib/services/mcp";
import type { ModelRuntime } from "@/types/provider";

export async function buildToolsForRuntime(
  user: SessionUser,
  search: boolean,
  runtime: ModelRuntime,
  projectId?: string
): Promise<{ tools: { [key: string]: Tool }; mcpClients: MCPClient[] }> {
  const providerTools = runtime.getProviderTools(search);

  const tools: { [key: string]: Tool } = {};

  if (user.memoryEnabled) {
    Object.assign(tools, createAgentMemoryTools(user.id, projectId));
  }

  if (user.skillsEnabled) {
    const skillCount = await countEnabledSkillsInScope(user.id, projectId);
    if (skillCount > 0) {
      tools.activate_skill = createActivateSkillTool(user.id);
    }
  }

  if (search) {
    tools.readUrl = readUrlTool;
  }

  Object.assign(tools, providerTools);

  const mcpClients = await getMcpClients(user.mcpServers);

  if (mcpClients) {
    const mcpTools = await getMcpTools(mcpClients);
    Object.assign(tools, mcpTools);
  }

  return { tools, mcpClients };
}

type PromptAddonParams = {
  memoryEnabled: boolean;
  skillsEnabled: boolean;
  temporaryChat: boolean;
  userId: string;
  projectId?: string;
};

export async function fetchSystemPromptAddons(
  params: PromptAddonParams
): Promise<string> {
  const [memoryPrompt, skillPrompt] = await Promise.all([
    params.memoryEnabled && !params.temporaryChat
      ? getAgentMemoryPrompt(params.userId, params.projectId)
      : Promise.resolve(""),
    params.skillsEnabled
      ? getSkillPrompt(params.userId, params.projectId)
      : Promise.resolve(""),
  ]);
  return `${memoryPrompt}${skillPrompt}`;
}

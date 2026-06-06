import type { MCPClient } from "@ai-sdk/mcp";
import type { JsonValue } from "@prisma/client/runtime/client";
import {
  createHttpMcpClient,
  createSseMcpClient,
  createStdioMcpClient,
} from "@/lib/backend/tools/mcp-clients";
import { logDuration } from "@/lib/backend/utils";

export class McpClientInitError extends Error {
  constructor() {
    super("Failed to initialize one or more MCP servers");
    this.name = "McpClientInitError";
    this.cause = "mcp_clients_init_error";
  }
}

export async function getMcpClients(mcpServers?: JsonValue | null): Promise<MCPClient[]> {
  const beforeFetch = performance.now();

  if (!mcpServers) {
    return [];
  }

  // biome-ignore lint/suspicious/noExplicitAny: external JSON config, shape is user-controlled
  let parsed: { mcpServers?: Record<string, any> };
  try {
    parsed = JSON.parse(mcpServers as string);
  } catch {
    return [];
  }
  const servers = parsed.mcpServers;
  if (!servers) {
    return [];
  }
  const entries: { serverKey: string; promise: Promise<MCPClient> }[] = [];

  for (const serverKey of Object.keys(servers)) {
    const server = servers[serverKey];
    if (server?.enabled === false) {
      continue;
    }
    const serverUrl = server.url as string | undefined;
    const command = server.command as string | undefined;
    const args = server.args as string[] | undefined;
    const env = (server.env as Record<string, string> | undefined) || {};
    const authorization = server.authorization as string | undefined;
    const headers = authorization ? { Authorization: authorization } : undefined;

    if (command && args) {
      entries.push({ serverKey, promise: createStdioMcpClient(command, args, env) });
      continue;
    }

    if (!serverUrl?.startsWith("http")) {
      continue;
    }

    const promise = serverUrl.includes("/sse")
      ? createSseMcpClient(serverUrl, headers)
      : createHttpMcpClient(serverUrl, headers);
    entries.push({ serverKey, promise });
  }

  const settled = await Promise.allSettled(entries.map((e) => e.promise));
  const failures: string[] = [];
  const clients: MCPClient[] = [];

  settled.forEach((result, index) => {
    if (result.status === "fulfilled") {
      clients.push(result.value);
    } else {
      failures.push(entries[index].serverKey);
    }
  });

  if (failures.length > 0) {
    throw new McpClientInitError();
  }

  logDuration(beforeFetch, "MCP client fetched");

  return clients;
}

export async function getMcpTools(clients: MCPClient[]) {
  const toolsPromises = clients?.map(async (client) => {
    const clientTools = await client.tools();
    return { ...clientTools };
  });
  const toolsArray = await Promise.all(toolsPromises);

  return Object.assign({}, ...toolsArray);
}

export async function closeMcpClients(clients: MCPClient[]) {
  await Promise.all(clients.map((client) => client.close()));
}

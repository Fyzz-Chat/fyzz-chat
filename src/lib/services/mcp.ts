import { getMcpServers } from "@/lib/actions/users";
import {
  createHttpMcpClient,
  createSseMcpClient,
  createStdioMcpClient,
} from "@/lib/backend/tools/mcp-clients";
import { logDuration } from "@/lib/backend/utils";
import type { experimental_MCPClient as McpClient } from "ai";

export class McpClientInitError extends Error {
  constructor() {
    super("Failed to initialize one or more MCP servers");
    this.name = "McpClientInitError";
    this.cause = "mcp_clients_init_error";
  }
}

export async function getMcpClients(): Promise<McpClient[]> {
  const beforeFetch = performance.now();

  const response = await getMcpServers();

  if (!response) {
    return [];
  }

  const servers = JSON.parse(response as string).mcpServers;
  const entries: { serverKey: string; promise: Promise<McpClient> }[] = [];

  for (const serverKey of Object.keys(servers)) {
    const server = servers[serverKey];
    const serverUrl = server.url as string | undefined;
    const command = server.command as string | undefined;
    const args = server.args as string[] | undefined;
    const env = (server.env as Record<string, string> | undefined) || {};

    if (command && args) {
      entries.push({ serverKey, promise: createStdioMcpClient(command, args, env) });
      continue;
    }

    if (!serverUrl || !serverUrl.startsWith("http")) {
      continue;
    }

    const promise = serverUrl.includes("/sse")
      ? createSseMcpClient(serverUrl)
      : createHttpMcpClient(serverUrl);
    entries.push({ serverKey, promise });
  }

  const settled = await Promise.allSettled(entries.map((e) => e.promise));
  const failures: string[] = [];
  const clients: McpClient[] = [];

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

export async function getMcpTools(clients: McpClient[]) {
  const toolsPromises = clients?.map(async (client) => {
    const clientTools = await client.tools();
    return { ...clientTools };
  });
  const toolsArray = await Promise.all(toolsPromises);

  return Object.assign({}, ...toolsArray);
}

export async function closeMcpClients(clients: McpClient[]) {
  await Promise.all(clients.map((client) => client.close()));
}

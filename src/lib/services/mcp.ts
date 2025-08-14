import { getMcpServers } from "@/lib/actions/users";
import {
  createHttpMcpClient,
  createSseMcpClient,
  createStdioMcpClient,
} from "@/lib/backend/tools/mcp-clients";
import { logDuration } from "@/lib/backend/utils";
import type { experimental_MCPClient as McpClient } from "ai";

export async function getMcpClients(): Promise<McpClient[]> {
  const beforeFetch = performance.now();

  const response = await getMcpServers();

  if (!response) {
    return [];
  }

  const servers = JSON.parse(response as string).mcpServers;
  const clientPromises: Promise<McpClient>[] = [];

  for (const serverKey of Object.keys(servers)) {
    const server = servers[serverKey];
    const serverUrl = server.url;
    const command = server.command;
    const args = server.args;
    const env = server.env || {};

    if (command && args) {
      const clientPromise = createStdioMcpClient(command, args, env);
      clientPromises.push(clientPromise);
      continue;
    }

    if (!serverUrl || !serverUrl.startsWith("http")) {
      continue;
    }

    const clientPromise = serverUrl.includes("/sse")
      ? createSseMcpClient(serverUrl)
      : createHttpMcpClient(serverUrl);

    clientPromises.push(clientPromise);
  }

  const clients = await Promise.all(clientPromises);
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

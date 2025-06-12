import { getMcpServers } from "@/lib/actions/users";
import { createHttpMcpClient, createSseMcpClient } from "@/lib/backend/tools/mcp-clients";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";

export async function getMcpClients() {
  const beforeFetch = performance.now();
  const userId = await getUserIdFromSession();

  const response = await getMcpServers();

  if (!response) {
    return [];
  }

  const servers = JSON.parse(response as string).mcpServers;
  const clientPromises: Promise<any>[] = [];

  for (const serverKey of Object.keys(servers)) {
    const server = servers[serverKey];
    const serverUrl = server.url;

    if (!serverUrl || !serverUrl.startsWith("https")) {
      continue;
    }

    const clientPromise = serverUrl.includes("/sse")
      ? createSseMcpClient(serverUrl)
      : createHttpMcpClient(serverUrl, userId.toString());

    clientPromises.push(clientPromise);
  }

  const clients = await Promise.all(clientPromises);
  logTime(beforeFetch);

  return clients;
}

function logTime(start: number) {
  const after = performance.now();
  logger.debug(`MCP client fetched in: ${(after - start).toFixed(2)}ms`);
}

export async function closeMcpClients(clients: any[]) {
  await Promise.all(clients.map((client) => client.close()));
}

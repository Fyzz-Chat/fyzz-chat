import { getMcpServers } from "@/lib/actions/users";
import { createHttpMcpClient, createSseMcpClient } from "@/lib/backend/tools/mcp-clients";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";

export async function getMcpClients() {
  const beforeFetch = performance.now();
  const userId = await getUserIdFromSession();

  const response = await getMcpServers();

  if (!response) {
    return undefined;
  }

  const servers = JSON.parse(response as string).mcpServers;

  const firstServer = Object.keys(servers)[0];
  const firstServerUrl = servers[firstServer].url;

  if (!firstServerUrl || !firstServerUrl.startsWith("https")) {
    return undefined;
  }

  if (firstServerUrl.includes("/sse")) {
    const client = await createSseMcpClient(firstServerUrl);
    logTime(beforeFetch);
    return client;
  }

  const client = await createHttpMcpClient(firstServerUrl, userId.toString());
  logTime(beforeFetch);
  return client;
}

function logTime(start: number) {
  const after = performance.now();
  logger.debug(`MCP client fetched in: ${(after - start).toFixed(2)}ms`);
}

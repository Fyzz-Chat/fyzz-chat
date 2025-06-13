import { getMcpServers } from "@/lib/actions/users";
import { createHttpMcpClient, createSseMcpClient } from "@/lib/backend/tools/mcp-clients";
import { logDuration } from "@/lib/backend/utils";
import { getUserIdFromSession } from "@/lib/dao/users";

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
  logDuration(beforeFetch, "MCP client fetched");

  return clients;
}

export async function getMcpTools(clients: any[]) {
  const toolsPromises = clients?.map(async (client) => {
    const clientTools = await client.tools();
    return { ...clientTools };
  });
  const toolsArray = await Promise.all(toolsPromises);

  return Object.assign({}, ...toolsArray);
}

export async function closeMcpClients(clients: any[]) {
  await Promise.all(clients.map((client) => client.close()));
}

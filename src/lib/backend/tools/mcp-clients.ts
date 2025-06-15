import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { experimental_createMCPClient as createMCPClient } from "ai";

export async function createHttpMcpClient(serverUrl: string) {
  const url = new URL(serverUrl);

  return await createMCPClient({
    transport: new StreamableHTTPClientTransport(url),
  });
}

export async function createSseMcpClient(
  serverUrl: string,
  headers?: Record<string, string>
) {
  return await createMCPClient({
    transport: {
      type: "sse",
      url: serverUrl,
      headers,
    },
  });
}

import { createMCPClient } from "@ai-sdk/mcp";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

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

export async function createStdioMcpClient(
  command: string,
  args: string[],
  env: Record<string, string>
) {
  return await createMCPClient({
    transport: new StdioClientTransport({
      command,
      args,
      env,
    }),
  });
}

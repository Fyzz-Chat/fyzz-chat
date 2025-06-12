import { createHash } from "crypto";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { experimental_createMCPClient as createMCPClient } from "ai";

export async function createHttpMcpClient(serverUrl: string, sessionId: string) {
  const url = new URL(serverUrl);
  const hashSessionId = createHash("sha1").update(sessionId).digest("hex");

  return await createMCPClient({
    transport: new StreamableHTTPClientTransport(url, {
      sessionId: hashSessionId,
    }),
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

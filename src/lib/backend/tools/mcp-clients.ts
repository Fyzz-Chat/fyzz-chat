import { createHash } from "crypto";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { experimental_createMCPClient as createMCPClient } from "ai";

const url = new URL("https://mcp.context7.com/mcp");

export async function createMCPClientWithSession(sessionId: string) {
  const hashSessionId = createHash("sha1").update(sessionId).digest("hex");
  return await createMCPClient({
    transport: new StreamableHTTPClientTransport(url, {
      sessionId: hashSessionId,
    }),
  });
}

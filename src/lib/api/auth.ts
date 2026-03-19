import "server-only";

import { validateApiKey } from "@/lib/dao/api-keys";

export async function authenticateApiRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.slice(7);
  return validateApiKey(key);
}

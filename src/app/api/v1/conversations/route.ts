import { authenticateApiRequest } from "@/lib/api/auth";
import { apiListConversations } from "@/lib/dao/api-queries";

export async function GET(request: Request) {
  const userId = await authenticateApiRequest(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;
  const projectIdParam = url.searchParams.get("projectId");
  const projectId = projectIdParam === "null" ? null : (projectIdParam ?? undefined);

  const result = await apiListConversations(userId, limit, cursor, search, projectId);

  return Response.json({
    data: result.items,
    meta: { cursor: result.nextCursor, hasMore: !!result.nextCursor },
  });
}

import { authenticateApiRequest } from "@/lib/api/auth";
import { apiGetConversation } from "@/lib/dao/api-queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await authenticateApiRequest(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const conversation = await apiGetConversation(userId, id);

  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ data: conversation });
}

import { authenticateApiRequest } from "@/lib/api/auth";
import { apiListProjects } from "@/lib/dao/api-queries";

export async function GET(request: Request) {
  const userId = await authenticateApiRequest(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await apiListProjects(userId);

  return Response.json({ data: projects });
}

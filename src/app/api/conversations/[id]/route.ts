import { getConversation } from "@/lib/dao/conversations";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const conversation = await getConversation(id);

  return NextResponse.json(conversation);
}

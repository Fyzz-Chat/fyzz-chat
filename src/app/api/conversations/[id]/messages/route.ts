import { getMessages } from "@/lib/dao/messages";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const messages = await getMessages(id);

  return NextResponse.json(messages);
}

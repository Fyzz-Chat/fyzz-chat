import { awsConfigured, generatePresignedUploadUrl } from "@/lib/aws/s3";
import { getUserIdFromSession } from "@/lib/dao/users";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const userId = await getUserIdFromSession();

  const { searchParams } = new URL(request.url);
  const count = searchParams.get("count");

  if (!count) {
    return NextResponse.json({ error: "Count is required" }, { status: 400 });
  }

  const response = await Promise.all(
    Array.from({ length: parseInt(count) }).map(async () => {
      const fileId = uuidv4();
      const key = `${userId}/${id}/${fileId}`;
      const url = awsConfigured ? await generatePresignedUploadUrl(key) : false;
      return { key: fileId, url };
    })
  );

  return NextResponse.json(response);
}

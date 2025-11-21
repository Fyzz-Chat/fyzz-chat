import { generatePresignedUploadUrl } from "@/lib/aws/s3";
import conf from "@/lib/config";
import { v4 as uuidv4 } from "uuid";

export async function getUploadUrls(
  userId: number,
  conversationId: string,
  count: number
) {
  const response = await Promise.all(
    Array.from({ length: count }).map(async () => {
      const fileId = uuidv4();
      const key = `${userId}/${conversationId}/${fileId}`;
      const url = conf.awsConfigured ? await generatePresignedUploadUrl(key) : "";
      return { key: fileId, url };
    })
  );

  return response;
}

import { v4 as uuidv4 } from "uuid";

import { generatePresignedUploadUrl } from "@/lib/aws/s3";

export async function getUploadUrls(
  userId: string,
  conversationId: string,
  count: number,
  fileIds?: string[]
) {
  const response = await Promise.all(
    Array.from({ length: count }).map(async (_, index) => {
      const fileId = fileIds && fileIds.length > index ? fileIds[index] : uuidv4();
      const key = `${userId}/${conversationId}/${fileId}`;
      const url = await generatePresignedUploadUrl(key);
      return { key: fileId, url };
    })
  );

  return response;
}

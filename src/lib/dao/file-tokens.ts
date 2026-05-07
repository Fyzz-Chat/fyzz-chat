import "server-only";
import prisma from "@/lib/prisma/prisma";

export async function getCachedFileTokens(fileKey: string): Promise<number | null> {
  const row = await prisma.fileTokenCache.findUnique({ where: { fileKey } });
  return row?.tokens ?? null;
}

export async function getCachedFileTokensBatch(
  fileKeys: string[]
): Promise<Map<string, number>> {
  if (fileKeys.length === 0) return new Map();
  const rows = await prisma.fileTokenCache.findMany({
    where: { fileKey: { in: fileKeys } },
    select: { fileKey: true, tokens: true },
  });
  return new Map(rows.map((row) => [row.fileKey, row.tokens]));
}

export async function cacheFileTokens(
  fileKey: string,
  tokens: number,
  mediaType: string
): Promise<void> {
  await prisma.fileTokenCache.upsert({
    where: { fileKey },
    update: { tokens, mediaType },
    create: { fileKey, tokens, mediaType },
  });
}

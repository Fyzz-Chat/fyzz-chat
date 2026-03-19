import "server-only";

import prisma from "@/lib/prisma/prisma";

function generateApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `fzk_${hex}`;
}

async function hashKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createApiKey(userId: string, name: string) {
  const rawKey = generateApiKey();
  const hash = await hashKey(rawKey);
  const prefix = rawKey.slice(0, 12);

  const apiKey = await prisma.apiKey.create({
    data: { name, prefix, hash, userId },
    select: { id: true, createdAt: true },
  });

  return { id: apiKey.id, rawKey, prefix, createdAt: apiKey.createdAt };
}

export async function getApiKeysByUser(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      prefix: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteApiKey(id: string, userId: string) {
  await prisma.apiKey.delete({
    where: { id, userId },
  });
}

export async function validateApiKey(rawKey: string): Promise<string | null> {
  if (!rawKey.startsWith("fzk_")) return null;

  const hash = await hashKey(rawKey);
  const apiKey = await prisma.apiKey.findUnique({
    where: { hash },
    select: { id: true, userId: true },
  });

  if (!apiKey) return null;

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return apiKey.userId;
}

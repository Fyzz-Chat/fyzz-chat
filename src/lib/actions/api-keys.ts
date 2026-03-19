"use server";

import { createApiKey, deleteApiKey } from "@/lib/dao/api-keys";
import { getUserIdFromSession } from "@/lib/dao/users";

export async function createApiKeyAction(name: string) {
  const userId = await getUserIdFromSession();
  return createApiKey(userId, name);
}

export async function deleteApiKeyAction(id: string) {
  const userId = await getUserIdFromSession();
  await deleteApiKey(id, userId);
}

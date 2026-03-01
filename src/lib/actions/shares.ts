"use server";

import "server-only";

import { deleteShare } from "@/lib/dao/shares";
import { getUserIdFromSession } from "@/lib/dao/users";

export async function deleteShareAction(shareId: string) {
  const user = await getUserIdFromSession();

  if (!user) {
    throw new Error("User not found");
  }

  await deleteShare(shareId);
}

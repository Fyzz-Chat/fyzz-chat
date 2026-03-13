"use server";

import "server-only";

import { deleteMessageChainAfterPersisted } from "@/lib/dao/messages";

export async function deleteMessageChainAfter(
  messageId: string,
  conversationId: string,
  newContent?: string
) {
  return deleteMessageChainAfterPersisted(messageId, conversationId, newContent);
}

import "server-only";

import type { Prisma } from "@/lib/prisma/generated/client";

export type MessageOrderAnchor = {
  sequence: number;
  createdAt: Date;
};

export const MESSAGE_ORDER_ASC: Prisma.MessageOrderByWithRelationInput[] = [
  { sequence: "asc" },
  { id: "asc" },
];

export const MESSAGE_ORDER_DESC: Prisma.MessageOrderByWithRelationInput[] = [
  { sequence: "desc" },
  { id: "desc" },
];

export function whereMessagesUpToAnchor(
  anchor: MessageOrderAnchor
): Prisma.MessageWhereInput {
  return { sequence: { lte: anchor.sequence } };
}

export function whereMessagesAfterAnchor(
  anchor: MessageOrderAnchor
): Prisma.MessageWhereInput {
  return { sequence: { gt: anchor.sequence } };
}

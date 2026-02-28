import "server-only";

import type { Prisma } from "@/lib/prisma/generated/client";

export type MessageOrderAnchor = {
  sequence: number | null;
  createdAt: Date;
};

// TODO[SEQ_CUTOVER]: Switch to sequence-first ordering once sequence is non-null everywhere in prod.
export const MESSAGE_ORDER_ASC: Prisma.MessageOrderByWithRelationInput[] = [
  { createdAt: "asc" },
  { sequence: "asc" },
  { id: "asc" },
];

// TODO[SEQ_CUTOVER]: Switch to sequence-first ordering once sequence is non-null everywhere in prod.
export const MESSAGE_ORDER_DESC: Prisma.MessageOrderByWithRelationInput[] = [
  { createdAt: "desc" },
  { sequence: "desc" },
  { id: "desc" },
];

// TODO[SEQ_CUTOVER]: Remove createdAt fallback branch after sequence is non-null everywhere in prod.
export function whereMessagesUpToAnchor(
  anchor: MessageOrderAnchor
): Prisma.MessageWhereInput {
  if (anchor.sequence === null) {
    return {
      createdAt: {
        lte: anchor.createdAt,
      },
    };
  }

  return {
    OR: [
      {
        sequence: {
          lte: anchor.sequence,
        },
      },
      {
        sequence: null,
        createdAt: {
          lte: anchor.createdAt,
        },
      },
    ],
  };
}

// TODO[SEQ_CUTOVER]: Remove createdAt fallback branch after sequence is non-null everywhere in prod.
export function whereMessagesAfterAnchor(
  anchor: MessageOrderAnchor
): Prisma.MessageWhereInput {
  if (anchor.sequence === null) {
    return {
      createdAt: {
        gt: anchor.createdAt,
      },
    };
  }

  return {
    OR: [
      {
        sequence: {
          gt: anchor.sequence,
        },
      },
      {
        sequence: null,
        createdAt: {
          gt: anchor.createdAt,
        },
      },
    ],
  };
}

import "server-only";

import { getFileUrlSigned } from "@/lib/aws/s3";
import { logger } from "@/lib/logger";
import { type CustomUIMessage, metadataSchema, type PartialMessage } from "@/types/chat";

export function mapFilePartsForRead(
  userId: string,
  conversationId: string,
  parts: CustomUIMessage["parts"] | undefined
): CustomUIMessage["parts"] | undefined {
  if (!parts) {
    return parts;
  }

  const keyPrefix = `${userId}/${conversationId}`;

  return parts.map((part) => {
    if (part.type !== "file" || part.url.startsWith("data:")) {
      return part;
    }

    return {
      ...part,
      url: getFileUrlSigned(keyPrefix, part.url),
    };
  });
}

export function mapMessageFilePartsForRead(
  userId: string,
  conversationId: string,
  message: CustomUIMessage
): CustomUIMessage {
  return {
    ...message,
    parts: mapFilePartsForRead(userId, conversationId, message.parts) ?? [],
  };
}

// Client-facing variant: emits a stable, non-expiring app URL that the
// /api/files route signs fresh on every request. Used for messages delivered
// to the browser (which get persisted to IndexedDB), so no time-bound signed
// URL is ever cached. The model path uses mapFilePartsForRead instead.
export function mapFilePartsForClient(
  userId: string,
  conversationId: string,
  parts: CustomUIMessage["parts"] | undefined
): CustomUIMessage["parts"] | undefined {
  if (!parts) {
    return parts;
  }

  return parts.map((part) => {
    if (part.type !== "file" || part.url.startsWith("data:")) {
      return part;
    }

    return {
      ...part,
      url: `/api/files/${userId}/${conversationId}/${part.url}`,
    };
  });
}

export function mapMessageFilePartsForClient(
  userId: string,
  conversationId: string,
  message: CustomUIMessage
): CustomUIMessage {
  return {
    ...message,
    parts: mapFilePartsForClient(userId, conversationId, message.parts) ?? [],
  };
}

// Parses a raw DB row into a UI message WITHOUT touching file URLs — parts keep
// their stored S3 key. URL mapping is applied at the edges: the client edge
// (tRPC) uses mapMessageFilePartsForClient, the model edge (chat route) uses
// mapMessageFilePartsForRead.
export function mapDbMessageToUiMessage(message: PartialMessage): CustomUIMessage {
  const parts = safeParseJson<CustomUIMessage["parts"]>(message.parts, []);

  const metadataResult = metadataSchema.safeParse(message.metadata);
  const baseMetadata = metadataResult.success
    ? metadataResult.data
    : {
        content: message.content ?? undefined,
        createdAt: message.createdAt ?? new Date(),
      };
  const metadata = {
    ...baseMetadata,
    sequence: message.sequence,
    status: message.status,
    externalId: message.externalId ?? undefined,
    failedReason: message.failedReason ?? undefined,
  };

  return {
    ...message,
    metadata,
    parts: parts ?? [],
  };
}

export function mapDbMessagesToUiMessages(messages: PartialMessage[]): CustomUIMessage[] {
  return messages.map((message) => mapDbMessageToUiMessage(message));
}

export function safeParseJson<T>(jsonValue: unknown, fallback: T): T {
  if (jsonValue == null) {
    return fallback;
  }

  if (typeof jsonValue !== "string") {
    return jsonValue as T;
  }

  if (jsonValue.trim() === "") {
    return fallback;
  }

  try {
    return JSON.parse(jsonValue);
  } catch (error) {
    logger.error(`Failed to parse JSON: ${jsonValue}`, error);
    return fallback;
  }
}

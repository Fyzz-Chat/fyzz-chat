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

export function mapDbMessageToUiMessage(
  userId: string,
  conversationId: string,
  message: PartialMessage
): CustomUIMessage {
  const parts = safeParseJson<CustomUIMessage["parts"]>(message.parts, []);

  const metadataResult = metadataSchema.safeParse(message.metadata);
  const metadata = metadataResult.success
    ? metadataResult.data
    : {
        content: message.content ?? undefined,
        createdAt: message.createdAt ?? new Date(),
      };

  return {
    ...message,
    metadata,
    parts: mapFilePartsForRead(userId, conversationId, parts) ?? [],
  };
}

export function mapDbMessagesToUiMessages(
  userId: string,
  conversationId: string,
  messages: PartialMessage[]
): CustomUIMessage[] {
  return messages.map((message) =>
    mapDbMessageToUiMessage(userId, conversationId, message)
  );
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

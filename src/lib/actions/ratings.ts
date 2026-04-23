"use server";

import "server-only";

import {
  deleteRating as deleteRatingDao,
  MessageNotFoundError,
  upsertRating,
} from "@/lib/dao/ratings";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";

type RatingActionError = "not_found" | "server";

export type RatingActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: RatingActionError; message: string };

export async function rateMessage(
  messageId: string,
  value: number
): Promise<RatingActionResult<{ id: string; value: number }>> {
  const userId = await getUserIdFromSession();
  try {
    const rating = await upsertRating(userId, messageId, value);
    return { ok: true, data: { id: rating.id, value: rating.value } };
  } catch (error) {
    if (error instanceof MessageNotFoundError) {
      return { ok: false, error: "not_found", message: error.message };
    }
    logger.error(error);
    return { ok: false, error: "server", message: "Failed to save rating." };
  }
}

export async function unrateMessage(
  messageId: string
): Promise<RatingActionResult<null>> {
  const userId = await getUserIdFromSession();
  try {
    await deleteRatingDao(messageId, userId);
    return { ok: true, data: null };
  } catch (error) {
    logger.error(error);
    return { ok: false, error: "server", message: "Failed to remove rating." };
  }
}

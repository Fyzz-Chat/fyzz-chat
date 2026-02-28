/*
  Warnings:

  - A unique constraint covering the columns `[conversation_id,sequence]` on the table `messages` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "sequence" INTEGER;

-- Backfill sequence per conversation in chronological order.
WITH ranked_messages AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "conversation_id"
      ORDER BY "created_at" ASC, "id" ASC
    ) AS "seq"
  FROM "messages"
)
UPDATE "messages" AS m
SET "sequence" = r."seq"
FROM ranked_messages AS r
WHERE m."id" = r."id";

-- CreateIndex
CREATE INDEX "messages_conversation_id_sequence_idx" ON "messages"("conversation_id", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "messages_conversation_id_sequence_key" ON "messages"("conversation_id", "sequence");

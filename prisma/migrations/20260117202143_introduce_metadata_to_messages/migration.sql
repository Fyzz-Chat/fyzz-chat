-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';

-- Migrate model to metadata

UPDATE "messages"
SET "metadata" = jsonb_set(
  COALESCE("metadata", '{}'::jsonb),
  '{model}',
  to_jsonb("model")
)
WHERE "model" IS NOT NULL;

-- Migrate content to metadata

UPDATE "messages"
SET "metadata" = jsonb_set(
  COALESCE("metadata", '{}'::jsonb),
  '{content}',
  to_jsonb("content")
)
WHERE "content" IS NOT NULL;

-- Migrate reasoning_durations to metadata

UPDATE "messages"
SET "metadata" = jsonb_set(
  COALESCE("metadata", '{}'::jsonb),
  '{reasoningDurations}',
  to_jsonb("reasoning_durations")
)
WHERE "reasoning_durations" IS NOT NULL;

-- Migrate created_at to metadata

UPDATE "messages"
SET "metadata" = jsonb_set(
  COALESCE("metadata", '{}'::jsonb),
  '{createdAt}',
  to_jsonb("created_at")
)
WHERE "created_at" IS NOT NULL;

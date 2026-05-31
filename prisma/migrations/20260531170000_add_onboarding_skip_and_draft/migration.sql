ALTER TABLE "users" ADD COLUMN "onboarding_skipped_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "onboarding_draft" JSONB;

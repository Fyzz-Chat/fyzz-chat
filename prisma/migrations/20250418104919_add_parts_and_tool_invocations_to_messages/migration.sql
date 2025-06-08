-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "parts" JSONB,
ADD COLUMN     "toolInvocations" JSONB;

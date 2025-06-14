-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "completion_tokens" INTEGER DEFAULT 0,
ADD COLUMN     "prompt_tokens" INTEGER DEFAULT 0;

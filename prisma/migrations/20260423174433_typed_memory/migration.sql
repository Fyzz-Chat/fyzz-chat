-- CreateEnum
CREATE TYPE "MemoryType" AS ENUM ('fact', 'opinion', 'learning', 'context', 'feedback');

-- AlterTable
ALTER TABLE "memories" ADD COLUMN     "category" TEXT,
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "conversation_id" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "type" "MemoryType" NOT NULL DEFAULT 'fact',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "memories_user_id_type_idx" ON "memories"("user_id", "type");

-- CreateIndex
CREATE INDEX "memories_user_id_type_confidence_idx" ON "memories"("user_id", "type", "confidence");

-- CreateIndex
CREATE INDEX "memories_project_id_type_idx" ON "memories"("project_id", "type");

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

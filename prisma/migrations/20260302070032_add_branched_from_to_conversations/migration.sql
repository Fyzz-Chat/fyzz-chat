-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "branched_from" TEXT;

-- CreateIndex
CREATE INDEX "conversations_branched_from_idx" ON "conversations"("branched_from");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_branched_from_fkey" FOREIGN KEY ("branched_from") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

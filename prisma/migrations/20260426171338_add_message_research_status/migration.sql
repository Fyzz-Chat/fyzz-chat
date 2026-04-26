-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('complete', 'pending', 'failed');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "failed_reason" TEXT,
ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'complete';

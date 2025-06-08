-- AlterTable
ALTER TABLE "users" ADD COLUMN     "memory" TEXT,
ADD COLUMN     "memory_enabled" BOOLEAN NOT NULL DEFAULT false;

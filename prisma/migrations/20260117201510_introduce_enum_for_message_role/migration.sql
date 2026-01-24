/*
  Warnings:

  - Changed the type of `role` on the `messages` table from String to MessageRole enum.

*/
-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('system', 'user', 'assistant');

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "role" TYPE "MessageRole" USING "role"::text::"MessageRole";

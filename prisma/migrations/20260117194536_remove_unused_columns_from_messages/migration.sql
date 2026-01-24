/*
  Warnings:

  - You are about to drop the column `files` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `reasoning` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `signature` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `toolInvocations` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "messages" DROP COLUMN "files",
DROP COLUMN "reasoning",
DROP COLUMN "signature",
DROP COLUMN "toolInvocations";

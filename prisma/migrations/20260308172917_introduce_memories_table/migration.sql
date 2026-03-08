/*
  Warnings:

  - You are about to drop the column `memory` on the `users` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "memories" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memories_user_id_idx" ON "memories"("user_id");

-- CreateIndex
CREATE INDEX "memories_project_id_idx" ON "memories"("project_id");

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing user memory data into the new memories table
INSERT INTO "memories" ("id", "content", "user_id", "created_at")
SELECT gen_random_uuid(), "memory", "id", NOW()
FROM "users"
WHERE "memory" IS NOT NULL AND "memory" != '';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "memory";

-- DropIndex
DROP INDEX "memories_project_id_idx";

-- DropIndex
DROP INDEX "messages_conversation_id_created_at_idx";

-- CreateIndex
CREATE INDEX "memories_user_id_project_id_created_at_idx" ON "memories"("user_id", "project_id", "created_at");

-- CreateIndex
CREATE INDEX "memories_project_id_created_at_idx" ON "memories"("project_id", "created_at");

-- CreateIndex
CREATE INDEX "ratings_conversation_id_user_id_idx" ON "ratings"("conversation_id", "user_id");

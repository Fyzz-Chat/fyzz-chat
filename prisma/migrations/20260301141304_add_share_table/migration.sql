-- CreateTable
CREATE TABLE "shares" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shares_conversation_id_idx" ON "shares"("conversation_id");

-- CreateIndex
CREATE INDEX "shares_message_id_idx" ON "shares"("message_id");

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

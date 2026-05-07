-- CreateTable
CREATE TABLE "file_token_cache" (
    "file_key" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "media_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_token_cache_pkey" PRIMARY KEY ("file_key")
);

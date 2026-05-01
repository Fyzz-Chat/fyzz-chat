/*
  Warnings:

  - Made the column `sequence` on table `messages` required. This step will fail if there are existing NULL values in that column.

*/
-- Safety: refuse to proceed if any NULL sequence values still exist.
DO $$
DECLARE
  null_count integer;
BEGIN
  SELECT COUNT(*) INTO null_count FROM messages WHERE sequence IS NULL;
  IF null_count > 0 THEN
    RAISE EXCEPTION 'Refusing to make sequence NOT NULL: % rows still have NULL sequence', null_count;
  END IF;
END $$;

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "sequence" SET NOT NULL;

/*
  Warnings:
  - Changed the type of `chatId` on the `TelegramChat` table. This migration handles the conversion from String to BigInt.
*/

-- Step 1: Add a temporary column for the new BigInt chatId
ALTER TABLE "TelegramChat" ADD COLUMN "chatId_temp" BIGINT;

-- Step 2: Copy and convert data from chatId (String) to chatId_temp (BigInt)
UPDATE "TelegramChat"
SET "chatId_temp" =
    CASE
        WHEN "chatId" ~ '^-?[0-9]+$' THEN CAST("chatId" AS BIGINT)
        ELSE NULL
    END;

-- Step 3: Check for invalid data (optional, for validation)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "TelegramChat"
        WHERE "chatId" IS NOT NULL
        AND "chatId" !~ '^-?[0-9]+$'
        LIMIT 1
    ) THEN
        RAISE EXCEPTION 'Invalid chatId values found in TelegramChat. All chatId values must be numeric.';
    END IF;
END $$;

-- Step 4: Drop the unique constraint on userId and chatId (if it exists from a previous schema)
ALTER TABLE "TelegramChat" DROP CONSTRAINT IF EXISTS "TelegramChat_userId_chatId_key";

-- Step 5: Drop the old chatId column
ALTER TABLE "TelegramChat" DROP COLUMN "chatId";

-- Step 6: Rename the temporary column to chatId
ALTER TABLE "TelegramChat" RENAME COLUMN "chatId_temp" TO "chatId";

-- Step 7: Make the new chatId column NOT NULL
ALTER TABLE "TelegramChat" ALTER COLUMN "chatId" SET NOT NULL;

-- Step 8: Recreate the unique constraint
CREATE UNIQUE INDEX "TelegramChat_userId_chatId_key" ON "TelegramChat"("userId", "chatId");

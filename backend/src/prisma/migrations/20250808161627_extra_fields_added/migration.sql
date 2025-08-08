/*
  Warnings:

  - Added the required column `allowsWriteToPm` to the `telegram_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "telegram_users"
ADD COLUMN "allowsWriteToPm" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "chatInstance" BIGINT,
ADD COLUMN "chatType" TEXT,
ADD COLUMN "languageCode" TEXT;

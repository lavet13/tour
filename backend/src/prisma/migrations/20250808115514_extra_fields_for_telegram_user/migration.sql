/*
  Warnings:

  - You are about to drop the column `hash` on the `telegram_users` table. All the data in the column will be lost.
  - Added the required column `allowsWriteToPm` to the `telegram_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "telegram_users" DROP COLUMN "hash",
ADD COLUMN     "allowsWriteToPm" BOOLEAN NOT NULL,
ADD COLUMN     "chatInstance" BIGINT,
ADD COLUMN     "chatType" TEXT,
ADD COLUMN     "languageCode" TEXT;

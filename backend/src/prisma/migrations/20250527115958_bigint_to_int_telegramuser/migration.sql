/*
  Warnings:

  - You are about to alter the column `telegramId` on the `telegram_users` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "telegram_users" ALTER COLUMN "telegramId" SET DATA TYPE INTEGER;

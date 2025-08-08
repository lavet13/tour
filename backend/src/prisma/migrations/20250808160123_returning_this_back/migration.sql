/*
  Warnings:

  - Added the required column `hash` to the `telegram_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "telegram_users" ADD COLUMN     "hash" TEXT NOT NULL;

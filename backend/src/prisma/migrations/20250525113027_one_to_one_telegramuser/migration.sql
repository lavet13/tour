/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `telegram_users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "telegram_users_userId_key" ON "telegram_users"("userId");

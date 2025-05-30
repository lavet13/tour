/*
  Warnings:

  - A unique constraint covering the columns `[userId,chatId]` on the table `TelegramChat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "bookings_status_routeId_travelDate_phoneNumber_idx";

-- DropIndex
DROP INDEX "schedules_time_idx";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "telegramId" BIGINT;

-- AlterTable
ALTER TABLE "telegram_users" ALTER COLUMN "telegramId" SET DATA TYPE BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "TelegramChat_userId_chatId_key" ON "TelegramChat"("userId", "chatId");

-- CreateIndex
CREATE INDEX "bookings_status_routeId_travelDate_idx" ON "bookings"("status", "routeId", "travelDate");

-- CreateIndex
CREATE INDEX "bookings_phoneNumber_idx" ON "bookings"("phoneNumber");

-- CreateIndex
CREATE INDEX "bookings_telegramId_idx" ON "bookings"("telegramId");

-- CreateIndex
CREATE INDEX "routes_price_idx" ON "routes"("price");

-- CreateIndex
CREATE INDEX "routes_departureDate_idx" ON "routes"("departureDate");

-- CreateIndex
CREATE INDEX "schedules_routeId_time_idx" ON "schedules"("routeId", "time");

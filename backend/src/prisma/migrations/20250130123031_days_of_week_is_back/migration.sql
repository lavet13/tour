/*
  Warnings:

  - You are about to drop the column `travelDate` on the `schedules` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[routeId,daysOfWeek]` on the table `schedules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DaysOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- DropIndex
DROP INDEX "schedules_routeId_travelDate_isActive_idx";

-- DropIndex
DROP INDEX "schedules_routeId_travelDate_key";

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "travelDate",
ADD COLUMN     "daysOfWeek" "DaysOfWeek" NOT NULL DEFAULT 'MONDAY';

-- CreateIndex
CREATE INDEX "schedules_routeId_daysOfWeek_isActive_idx" ON "schedules"("routeId", "daysOfWeek", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_routeId_daysOfWeek_key" ON "schedules"("routeId", "daysOfWeek");

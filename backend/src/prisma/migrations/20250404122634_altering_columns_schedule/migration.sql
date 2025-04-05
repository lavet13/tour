/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `direction` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RouteDirection" AS ENUM ('FORWARD', 'BACKWARD');

-- DropIndex
DROP INDEX "schedules_routeId_dayOfWeek_key";

-- DropIndex
DROP INDEX "schedules_routeId_isActive_idx";

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "dayOfWeek",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "arrivalTime" TEXT,
ADD COLUMN     "departureTime" TEXT,
ADD COLUMN     "direction" "RouteDirection" NOT NULL,
ADD COLUMN     "stopName" TEXT;

-- DropEnum
DROP TYPE "DaysOfWeek";

-- CreateIndex
CREATE INDEX "schedules_routeId_direction_isActive_idx" ON "schedules"("routeId", "direction", "isActive");

-- CreateIndex
CREATE INDEX "schedules_departureTime_idx" ON "schedules"("departureTime");

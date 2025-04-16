/*
  Warnings:

  - You are about to drop the column `arrivalTime` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `departureTime` on the `schedules` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "schedules_departureTime_idx";

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "arrivalTime",
DROP COLUMN "departureTime",
ADD COLUMN     "time" TEXT;

-- CreateIndex
CREATE INDEX "schedules_time_idx" ON "schedules"("time");

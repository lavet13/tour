/*
  Warnings:

  - You are about to drop the column `daysOfWeek` on the `schedules` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "schedules_routeId_daysOfWeek_isActive_idx";

-- DropIndex
DROP INDEX "schedules_routeId_daysOfWeek_key";

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "daysOfWeek";

-- CreateTable
CREATE TABLE "schedule_days" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "dayOfWeek" "DaysOfWeek" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_days_scheduleId_dayOfWeek_key" ON "schedule_days"("scheduleId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "schedules_routeId_isActive_idx" ON "schedules"("routeId", "isActive");

-- AddForeignKey
ALTER TABLE "schedule_days" ADD CONSTRAINT "schedule_days_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

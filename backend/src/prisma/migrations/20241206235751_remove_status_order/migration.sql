/*
  Warnings:

  - You are about to drop the column `statusOrder` on the `bookings` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "bookings_statusOrder_status_idx";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "statusOrder";

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

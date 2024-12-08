-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "statusOrder" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "bookings_statusOrder_status_idx" ON "bookings"("statusOrder", "status");

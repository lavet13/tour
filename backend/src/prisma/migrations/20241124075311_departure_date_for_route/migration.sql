/*
  Warnings:

  - You are about to drop the column `departureDate` on the `schedules` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "routes" ADD COLUMN     "departureDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "departureDate";

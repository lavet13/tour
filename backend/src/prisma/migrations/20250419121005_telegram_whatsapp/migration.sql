/*
  Warnings:

  - Added the required column `telegram` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatsapp` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "telegram" BOOLEAN NOT NULL,
ADD COLUMN     "whatsapp" BOOLEAN NOT NULL;

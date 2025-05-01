-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "extraPhoneNumber" TEXT,
ADD COLUMN     "extraTelegram" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "extraWhatsapp" BOOLEAN NOT NULL DEFAULT false;

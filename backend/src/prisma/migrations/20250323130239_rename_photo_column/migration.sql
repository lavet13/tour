/*
  Warnings:

  - You are about to drop the column `photo` on the `routes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "routes" DROP COLUMN "photo",
ADD COLUMN     "photoName" TEXT;

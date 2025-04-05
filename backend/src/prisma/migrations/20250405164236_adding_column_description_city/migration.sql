/*
  Warnings:

  - Added the required column `description` to the `cities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "description" TEXT NOT NULL;

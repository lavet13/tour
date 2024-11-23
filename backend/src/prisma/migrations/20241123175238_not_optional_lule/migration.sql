/*
  Warnings:

  - Made the column `regionId` on table `routes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_regionId_fkey";

-- AlterTable
ALTER TABLE "routes" ALTER COLUMN "regionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

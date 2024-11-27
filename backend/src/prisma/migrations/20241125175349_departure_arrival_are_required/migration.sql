/*
  Warnings:

  - Made the column `departureCityId` on table `routes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `arrivalCityId` on table `routes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_arrivalCityId_fkey";

-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_departureCityId_fkey";

-- AlterTable
ALTER TABLE "routes" ALTER COLUMN "departureCityId" SET NOT NULL,
ALTER COLUMN "arrivalCityId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_departureCityId_fkey" FOREIGN KEY ("departureCityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_arrivalCityId_fkey" FOREIGN KEY ("arrivalCityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

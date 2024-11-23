-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_arrivalCityId_fkey";

-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_departureCityId_fkey";

-- AlterTable
ALTER TABLE "routes" ALTER COLUMN "departureCityId" DROP NOT NULL,
ALTER COLUMN "arrivalCityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_departureCityId_fkey" FOREIGN KEY ("departureCityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_arrivalCityId_fkey" FOREIGN KEY ("arrivalCityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

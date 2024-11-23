-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_regionId_fkey";

-- AlterTable
ALTER TABLE "routes" ALTER COLUMN "regionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

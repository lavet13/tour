/*
  Warnings:

  - A unique constraint covering the columns `[departureCityId,arrivalCityId]` on the table `routes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[routeId,dayOfWeek]` on the table `schedules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "routes_departureCityId_arrivalCityId_key" ON "routes"("departureCityId", "arrivalCityId");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_routeId_dayOfWeek_key" ON "schedules"("routeId", "dayOfWeek");

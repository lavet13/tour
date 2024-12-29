-- DropIndex
DROP INDEX "bookings_status_idx";

-- CreateIndex
CREATE INDEX "bookings_status_routeId_travelDate_phoneNumber_idx" ON "bookings"("status", "routeId", "travelDate", "phoneNumber");

-- CreateIndex
CREATE INDEX "cities_name_idx" ON "cities"("name");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_token_idx" ON "refresh_tokens"("userId", "token");

-- CreateIndex
CREATE INDEX "routes_departureCityId_arrivalCityId_regionId_isActive_depa_idx" ON "routes"("departureCityId", "arrivalCityId", "regionId", "isActive", "departureDate");

-- CreateIndex
CREATE INDEX "schedules_dayOfWeek_routeId_travelDate_isActive_idx" ON "schedules"("dayOfWeek", "routeId", "travelDate", "isActive");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

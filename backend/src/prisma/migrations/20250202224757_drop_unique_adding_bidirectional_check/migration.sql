-- DropIndex
DROP INDEX "routes_departureCityId_arrivalCityId_key";

-- Создаём новый симметричный уникальный индекс
CREATE UNIQUE INDEX unique_route_symmetry
ON routes (
  LEAST("departureCityId", "arrivalCityId"),
  GREATEST("departureCityId", "arrivalCityId")
);

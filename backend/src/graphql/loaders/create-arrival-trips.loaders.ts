import DataLoader from 'dataloader';
import prismaClient from '@/prisma';
import { Route } from '@prisma/client';

export const createArrivalTripsLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (cityIds: readonly bigint[]) => {
    const routes = await prisma.route.findMany({
      where: {
        arrivalCityId: { in: cityIds as bigint[] },
      },
    });

    const routesByCityId = new Map<bigint, Route[]>(
      cityIds.map(id => [id, []]),
    );

    routes.forEach(route => {
      if (routesByCityId.has(route.departureCityId!)) {
        routesByCityId.get(route.departureCityId!)!.push(route);
      }
    });

    return cityIds.map(cityId => routesByCityId.get(cityId) || []);
  });
};

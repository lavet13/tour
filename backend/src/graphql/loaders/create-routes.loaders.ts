import DataLoader from 'dataloader';
import prismaClient from '@/prisma';
import { Route } from '@prisma/client';

export const createRoutesLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (cityIds: readonly bigint[]) => {
    // console.log('Loading routes for cityIds:', cityIds);

    const routes = await prisma.route.findMany({
      where: {
        OR: [
          { departureCityId: { in: cityIds as bigint[] } },
          { arrivalCityId: { in: cityIds as bigint[] } },
        ],
      },
    });

    // console.log('Found routes:', routes.length);

    const routesByCityId = new Map<
      bigint,
      { departureTrips: Route[]; arrivalTrips: Route[] }
    >(cityIds.map(id => [id, { departureTrips: [], arrivalTrips: [] }]));

    routes.forEach(route => {
      if (routesByCityId.has(route.departureCityId)) {
        routesByCityId
          .get(route.departureCityId)!
          .departureTrips.push(route);
      }
      if (routesByCityId.has(route.arrivalCityId)) {
        routesByCityId.get(route.arrivalCityId)!.arrivalTrips.push(route);
      }
    });

    return cityIds.map(
      id =>
        routesByCityId.get(id) || { departureTrips: [], arrivalTrips: [] },
    );
  });
};

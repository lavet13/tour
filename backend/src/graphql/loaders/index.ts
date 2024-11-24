import prismaClient from '@/prisma';
import { createCityLoader } from '@/graphql/loaders/create-city.loaders';
import { createRouteLoader } from '@/graphql/loaders/create-route.loaders';
import { createBookingsLoader } from '@/graphql/loaders/create-bookings.loaders';
import { createSchedulesLoader } from '@/graphql/loaders/create-schedules.loaders';
import { createDepartureTripsLoader } from '@/graphql/loaders/create-departure-trips.loaders';
import { createArrivalTripsLoader } from '@/graphql/loaders/create-arrival-trips.loaders';
import { createRegionLoader } from '@/graphql/loaders/create-region.loaders';
import { createRoutesLoader } from '@/graphql/loaders/create-routes.loaders';

export const createLoaders = (prisma: typeof prismaClient) => ({
  regionLoader: createRegionLoader(prisma),
  cityLoader: createCityLoader(prisma),
  routeLoader: createRouteLoader(prisma),
  routesLoader: createRoutesLoader(prisma),
  bookingsLoader: createBookingsLoader(prisma),
  schedulesLoader: createSchedulesLoader(prisma),
  departureTripsLoader: createDepartureTripsLoader(prisma),
  arrivalTripsLoader: createArrivalTripsLoader(prisma),
});
import prismaClient from '@/prisma';
import { createRoutesLoader } from '@/graphql/loaders/create-routes.loaders';
import { createCityLoader } from '@/graphql/loaders/create-city.loaders';
import { createRouteLoader } from '@/graphql/loaders/create-route.loaders';
import { createBookingsLoader } from '@/graphql/loaders/create-bookings.loaders';
import { createSchedulesLoader } from '@/graphql/loaders/create-schedules.loaders';

export const createLoaders = (prisma: typeof prismaClient) => ({
  routesLoader: createRoutesLoader(prisma),
  cityLoader: createCityLoader(prisma),
  routeLoader: createRouteLoader(prisma),
  bookingsLoader: createBookingsLoader(prisma),
  schedulesLoader: createSchedulesLoader(prisma),
});

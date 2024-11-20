import prismaClient from '@/prisma';
import { createBookingsLoader } from '@/graphql/loaders/create-bookings.loaders';
import { createCityLoader } from '@/graphql/loaders/create-city.loaders';

export const createLoaders = (prisma: typeof prismaClient) => ({
  bookingsLoader: createBookingsLoader(prisma),
  cityLoader: createCityLoader(prisma),
});

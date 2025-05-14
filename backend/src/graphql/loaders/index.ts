import prismaClient from '@/prisma';
import { createCityLoader } from '@/graphql/loaders/create-city.loaders';
import { createRouteLoader } from '@/graphql/loaders/create-route.loaders';
import { createBookingsLoader } from '@/graphql/loaders/create-bookings.loaders';
import { createSchedulesLoader } from '@/graphql/loaders/create-schedules.loaders';
import { createDepartureTripsLoader } from '@/graphql/loaders/create-departure-trips.loaders';
import { createArrivalTripsLoader } from '@/graphql/loaders/create-arrival-trips.loaders';
import { createRegionLoader } from '@/graphql/loaders/create-region.loaders';
import { createRoutesLoader } from '@/graphql/loaders/create-routes.loaders';
import { createScheduleDaysLoader } from './create-schedule-days.loaders';
import { createScheduleLoader } from './create-schedule.loaders';
import { createTelegramChatIdsLoader } from './create-telegram-chat-ids.loaders';

export const createLoaders = (prisma: typeof prismaClient) => ({
  regionLoader: createRegionLoader(prisma),
  cityLoader: createCityLoader(prisma),
  routeLoader: createRouteLoader(prisma),
  routesLoader: createRoutesLoader(prisma),
  bookingsLoader: createBookingsLoader(prisma),
  scheduleDaysLoader: createScheduleDaysLoader(prisma),
  schedulesLoader: createSchedulesLoader(prisma),
  scheduleLoader: createScheduleLoader(prisma),
  departureTripsLoader: createDepartureTripsLoader(prisma),
  arrivalTripsLoader: createArrivalTripsLoader(prisma),
  telegramChatIdsLoader: createTelegramChatIdsLoader(prisma),
});

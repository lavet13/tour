import { Resolvers } from '@/graphql/__generated__/types';
import { isAuthenticated } from '@/graphql/composition/authorization';
import { hasRoles } from '@/graphql/composition/authorization';
import { generateSchedulesForNextWeek } from '@/jobs/schedule-generator';

import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { GraphQLError } from 'graphql';

const resolvers: Resolvers = {
  Query: {
    async schedulesByRoute(_, args, ctx) {
      const routeId = args.routeId;

      const route = await ctx.prisma.route
        .findUniqueOrThrow({
          where: {
            id: routeId,
          },
          select: {
            id: true,
          },
        })
        .catch((err: unknown) => {
          if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === 'P2025') {
              throw new GraphQLError(
                `Маршрут с таким идентификатором \`${routeId}\` не найден.`,
              );
            }
          }
          console.log({ err });
          throw new GraphQLError('Unknown error!');
        });

      const schedules = await ctx.prisma.schedule.findMany({
        where: {
          routeId: route.id,
        },
      });

      return schedules;
    },
  },
  Mutation: {
    async createSchedule(_, args, ctx) {
      const {
        routeId,
        endTime,
        startTime,
        dayOfWeek,
        seatsAvailable,
        price,
        isActive,
        travelDate,
        seatsBooked,
      } = args.input;

      const route = await ctx.prisma.route.findUnique({
        where: {
          id: routeId,
        },
      });

      if (!route) {
        throw new GraphQLError(`Route with ID ${routeId} not found.`);
      }

      const schedule = await ctx.prisma.schedule.create({
        data: {
          routeId,
          dayOfWeek,
          startTime,
          endTime,
          seatsAvailable,
          travelDate,
          price,
          isActive,
          seatsBooked,
        },
      });

      // Trigger future schedule generation after creating a new schedule
      await generateSchedulesForNextWeek(ctx.prisma);

      return schedule;
    },
  },
  Schedule: {
    route(parent, _, { loaders }) {
      return loaders.routeLoader.load(parent.routeId);
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {
  'Mutation.createSchedule': [
    isAuthenticated(),
    hasRoles([Role.MANAGER, Role.ADMIN]),
  ],
};

export default composeResolvers(resolvers, resolversComposition);

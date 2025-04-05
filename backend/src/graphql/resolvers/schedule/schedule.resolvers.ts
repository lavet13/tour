import { Resolvers } from '@/graphql/__generated__/types';
import { isAuthenticated } from '@/graphql/composition/authorization';
import { hasRoles } from '@/graphql/composition/authorization';

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
    async scheduleById(_, args, ctx) {
      const id = args.scheduleId;

      if (!id?.length) {
        return null;
      }

      const schedule = await ctx.prisma.schedule
        .findUniqueOrThrow({
          where: {
            id,
          },
        })
        .catch((err: unknown) => {
          if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === 'P2025') {
              throw new GraphQLError(
                `Расписание с таким идентификатором \`${id}\` не найден.`,
              );
            }
          }
          console.log({ err });
          throw new GraphQLError('Unknown error!');
        });

      return schedule;
    },
    async schedulesByIds(_, args, ctx) {
      const { departureCityId, arrivalCityId } = args;

      // Try both route directions
      const [forwardRoute, reverseRoute] = await Promise.all([
        ctx.prisma.route.findFirst({
          where: {
            departureCityId,
            arrivalCityId,
          },
        }),
        ctx.prisma.route.findFirst({
          where: {
            departureCityId: arrivalCityId,
            arrivalCityId: departureCityId,
          },
        }),
      ]);

      // Use the first non-null route found
      const route = forwardRoute || reverseRoute;

      // If no route was found in either direction
      if (!route) {
        throw new GraphQLError(
          'Неверный/Несуществующий маршрут, указанный для бронирования.',
        );
      }

      const schedules = await ctx.prisma.schedule.findMany({
        where: {
          route: {
            id: route.id,
          },
        },
      });

      return schedules;
    },
  },
  Mutation: {
    async createSchedule(_, args, ctx) {
      const {
        routeId,
        isActive,
        stopName,
        arrivalTime,
        departureTime,
        direction,
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
          direction,
          stopName,
          departureTime,
          arrivalTime,
          isActive,
        },
      });

      return schedule;
    },
    async updateSchedule(_, args, ctx) {
      const { stopName, arrivalTime, departureTime, id, isActive, direction } =
        args.input;

      const schedule = await ctx.prisma.schedule.update({
        where: {
          id,
        },
        data: {
          isActive,
          stopName,
          arrivalTime,
          departureTime,
          direction,
        },
      });

      return schedule;
    },
    async deleteSchedule(_, args, ctx) {
      const id = args.id;

      const deletedSchedule = await ctx.prisma.schedule
        .delete({
          where: {
            id,
          },
        })
        .catch((err: unknown) => {
          if (err instanceof PrismaClientKnownRequestError) {
            console.log({ errCode: err.code });
            if (err.code === 'P2025') {
              throw new GraphQLError(
                `Данной записи не существует в расписании!`,
              );
            }
          }
          console.log({ err });
          throw new GraphQLError('Unknown error!');
        });

      return deletedSchedule;
    },
  },
  Schedule: {
    route(parent, _, { loaders }) {
      return parent.routeId ? loaders.routeLoader.load(parent.routeId) : null;
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

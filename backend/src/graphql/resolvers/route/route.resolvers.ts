import { Resolvers, SearchTypeRoutes } from '@/graphql/__generated__/types';
import { Prisma, Role } from '@prisma/client';

import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { GraphQLError } from 'graphql';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { applyConstraints } from '@/helpers/apply-constraints';
import { hasRoles, isAuthenticated } from '@/graphql/composition/authorization';

const resolvers: Resolvers = {
  Query: {
    async routes(_, args, ctx) {
      const query = args.input.query?.trim();

      enum PaginationDirection {
        NONE = 'NONE',
        FORWARD = 'FORWARD',
        BACKWARD = 'BACKWARD',
      }

      const direction: PaginationDirection = args.input.after
        ? PaginationDirection.FORWARD
        : args.input.before
          ? PaginationDirection.BACKWARD
          : PaginationDirection.NONE;

      const take = Math.abs(
        applyConstraints({
          type: 'take',
          min: 1,
          max: 50,
          value: args.input.take ?? 30,
        }),
      );

      let cursor =
        direction === PaginationDirection.NONE
          ? undefined
          : { id: args.input.after || args.input.before };

      // in case where we might get cursor which points to nothing
      if (direction !== PaginationDirection.NONE) {
        // checking if the cursor pointing to the wbOrder doesn't exist,
        // otherwise skip
        const cursorOrder = await ctx.prisma.booking.findUnique({
          where: { id: cursor?.id },
        });

        if (!cursorOrder) cursor = undefined;
      }

      const searchType = Object.values(SearchTypeRoutes);
      const conditions: Prisma.RouteWhereInput[] = [];

      if (searchType.includes(SearchTypeRoutes.Id)) {
        conditions.push({ id: { equals: query } });
      }

      const sorting = args.input.sorting;
      const orderBy = sorting[0]
        ? { [sorting[0].id]: sorting[0].desc ? 'desc' : 'asc' }
        : [];

      // fetching routes with extra one, so to determine if there's more to fetch
      const routes = await ctx.prisma.route.findMany({
        take:
          direction === PaginationDirection.BACKWARD ? -(take + 1) : take + 1, // Fetch one extra wbOrder for determining `hasNextPage`
        cursor,
        skip: cursor ? 1 : undefined, // Skip the cursor wbOrder for the next/previous page
        orderBy,
        where: {
          OR:
            query.length !== 0 && conditions.length > 0
              ? conditions
              : undefined,
        },
      });

      if (routes.length === 0) {
        return {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      const edges =
        direction === PaginationDirection.BACKWARD
          ? routes.slice(1).reverse().slice(0, take) // For backward pagination, remove first item and take requested amount
          : routes.slice(0, take); // For forward/none pagination, just take requested amount

      const hasMore = routes.length > take;

      const startCursor = edges.length === 0 ? null : edges[0]?.id;
      const endCursor = edges.length === 0 ? null : edges.at(-1)?.id;

      const hasNextPage =
        direction === PaginationDirection.BACKWARD ||
        (direction === PaginationDirection.FORWARD && hasMore) ||
        (direction === PaginationDirection.NONE &&
          edges.length < routes.length);

      const hasPreviousPage =
        direction === PaginationDirection.FORWARD ||
        (direction === PaginationDirection.BACKWARD && hasMore);

      return {
        edges,
        pageInfo: {
          startCursor,
          endCursor,
          hasNextPage,
          hasPreviousPage,
        },
      };
    },
    async routeById(_, args, ctx) {
      const id = args.id;

      const route = await ctx.prisma.route
        .findUnique({
          where: {
            id,
          },
        })
        .catch((err: unknown) => {
          if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === 'P2025') {
              throw new GraphQLError(`Route with ID \`${id}\` not found.`);
            }
          }
          console.log({ err });
          throw new GraphQLError('Unknown error!');
        });

      return route;
    },
    async routesByRegion(_, { regionId }, { prisma }) {
      const cities = await prisma.city.findMany({
        where: {
          departureTrips: {
            some: {
              regionId,
              isActive: true,
            },
          },
        },
        include: {
          departureTrips: {
            include: {
              arrivalCity: true,
            },
          },
        },
      });

      console.log({ cities });

      return cities;
    },
  },
  Mutation: {
    async createRoute(_, args, ctx) {
      const { arrivalCityId, departureCityId } = args.input;
      console.log({ input: args.input });

      const route = await ctx.prisma.route.create({
        data: {
          arrivalCityId,
          departureCityId,
        },
      });

      return route;
    },
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

      return schedule;
    },
  },
  Route: {
    region(parent, _, { loaders }) {
      return loaders.regionLoader.load(parent.regionId);
    },
    arrivalCity(parent, _, { loaders }) {
      return loaders.cityLoader.load(parent.arrivalCityId);
    },
    departureCity(parent, _, { loaders }) {
      return loaders.cityLoader.load(parent.departureCityId);
    },
    bookings(parent, _, { loaders }) {
      return loaders.bookingsLoader.load(parent.id);
    },
    schedules(parent, _, { loaders }) {
      return loaders.schedulesLoader.load(parent.id);
    },
  },
  Schedule: {
    route(parent, _, { loaders }) {
      return loaders.routeLoader.load(parent.routeId);
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {
  'Query.routeById': [isAuthenticated(), hasRoles([Role.MANAGER, Role.ADMIN])],
  'Mutation.createSchedule': [
    isAuthenticated(),
    hasRoles([Role.MANAGER, Role.ADMIN]),
  ],
  // 'Subscription.newWbOrder': [
  //   isAuthenticated(),
  //   hasRoles([Role.MANAGER, Role.ADMIN]),
  // ],
};

export default composeResolvers(resolvers, resolversComposition);

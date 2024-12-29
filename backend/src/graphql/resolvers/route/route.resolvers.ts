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
          : {
              id:
                direction === PaginationDirection.FORWARD
                  ? args.input.after ?? undefined
                  : args.input.before ?? undefined,
            };

      // in case where we might get cursor which points to nothing
      if (direction !== PaginationDirection.NONE) {
        // checking if the cursor pointing to the wbOrder doesn't exist,
        // otherwise skip
        const cursorOrder = await ctx.prisma.route.findUnique({
          where: { id: cursor?.id },
        });

        if (!cursorOrder) {
          if (direction === PaginationDirection.FORWARD) {
            // this shit is shit and isn't work for me,
            // or because perhaps I am retard ☺️💕
            //
            // const previousValidPost = await ctx.prisma.wbOrder.findFirst({
            //   where: { id: { lt: args.input.after } },
            //   orderBy: { id: 'desc' },
            // });
            // console.log({ previousValidPost });
            // cursor = previousValidPost ? { id: previousValidPost.id } : undefined;

            cursor = { id: -1 }; // we guarantee routes are empty
          } else if (direction === PaginationDirection.BACKWARD) {
            const nextValidOrder = await ctx.prisma.route.findFirst({
              where: {
                id: {
                  gt: args.input.before,
                },
              },
              orderBy: {
                id: 'asc',
              },
            });

            cursor = nextValidOrder ? { id: nextValidOrder.id } : undefined;
          }
        }
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

      // If no results are retrieved, it means we've reached the end of the
      // pagination or because we stumble upon invalid cursor, so on the
      // client we just clearing `before` and `after` cursors to get first routes
      // forward pagination could have no routes at all,
      // or because cursor is set to `{ id: -1 }`, for backward pagination
      // the only thing would happen if only routes are empty!
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

      // Fix: Properly handle edge slicing based on direction and take value
      const edges =
        direction === PaginationDirection.BACKWARD
          ? routes.slice(1).reverse().slice(0, take) // For backward pagination, remove first item and take requested amount
          : routes.slice(0, take); // For forward/none pagination, just take requested amount

      const hasMore = routes.length > take;

      const startCursor = edges.length === 0 ? null : edges[0]?.id;
      const endCursor = edges.length === 0 ? null : edges.at(-1)?.id;

      // This is where the condition `edges.length < routes.length` comes into
      // play. If the length of the `edges` array is less than the length
      // of the `routes` array, it means that the extra wbOrder was fetched and
      // excluded from the `edges` array. That implies that there are more
      // routes available to fetch in the current pagination direction.
      const hasNextPage =
        direction === PaginationDirection.BACKWARD ||
        (direction === PaginationDirection.FORWARD && hasMore) ||
        (direction === PaginationDirection.NONE &&
          edges.length < routes.length);
      // /\
      // |
      // |
      // NOTE: This condition `edges.length < routes.length` is essentially
      // checking the same thing as `hasMore`, which is whether there are more
      // routes available to fetch. Therefore, you can safely replace
      // `edges.length < routes.length` with hasMore in the condition for
      // determining hasNextPage. Both conditions are equivalent and will
      // produce the same result.

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
      const { routeId, daysOfWeek } =
        args.input;

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

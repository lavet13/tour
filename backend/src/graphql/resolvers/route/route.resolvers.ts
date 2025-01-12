import { Resolvers } from '@/graphql/__generated__/types';
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
      const query = args.input.query;

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
          min: 5,
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
        const cursorOrder = await ctx.prisma.route.findUnique({
          where: { id: cursor?.id },
        });

        if (!cursorOrder) cursor = undefined;
      }

      // Prepare sorting
      const sorting = args.input.sorting || [];

      const orderBy: Prisma.BookingOrderByWithRelationInput[] = sorting.length
        ? sorting.flatMap((sort): Prisma.BookingOrderByWithRelationInput[] => {
            return [{ [sort.id]: sort.desc ? 'desc' : 'asc' }, { id: 'asc' }];
          })
        : [{ updatedAt: 'desc' }, { id: 'asc' }];

      // fetching bookings with extra one, so to determine if there's more to fetch
      const routes = await ctx.prisma.route.findMany({
        take:
          direction === PaginationDirection.BACKWARD ? -(take + 1) : take + 1, // Fetch one extra wbOrder for determining `hasNextPage`
        cursor,
        skip: cursor ? 1 : undefined, // Skip the cursor wbOrder for the next/previous page
        orderBy,
        where: {
          OR: [
            {
              arrivalCity: {
                name: { contains: query, mode: 'insensitive' },
              },
            },
            {
              departureCity: {
                name: { contains: query, mode: 'insensitive' },
              },
            },
          ],
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
        routes.length <= take
          ? routes
          : direction === PaginationDirection.BACKWARD
            ? routes.slice(1, routes.length)
            : routes.slice(0, -1);

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

      if(!id?.length) {
        return null;
      }

      const route = await ctx.prisma.route
        .findUniqueOrThrow({
          where: {
            id,
          },
        })
        .catch((err: unknown) => {
          if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === 'P2025') {
              throw new GraphQLError(`Маршрут с таким идентификатором \`${id}\` не найден.`);
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
};

const resolversComposition: ResolversComposerMapping<any> = {
  'Query.routeById': [isAuthenticated(), hasRoles([Role.MANAGER, Role.ADMIN])],
  'Query.routes': [isAuthenticated(), hasRoles([Role.MANAGER, Role.ADMIN])],
  'Mutation.createRoute': [
    isAuthenticated(),
    hasRoles([Role.MANAGER, Role.ADMIN]),
  ],
};

export default composeResolvers(resolvers, resolversComposition);

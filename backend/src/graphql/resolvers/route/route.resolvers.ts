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
    async infiniteRoutes(_, args, ctx) {
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

      const initialLoading = args.input.initialLoading;

      const take = initialLoading
        ? 5
        : Math.abs(
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
        const cursorOrder = await ctx.prisma.route.findUnique({
          where: { id: cursor?.id },
        });

        if (!cursorOrder) cursor = undefined;
      }

      // Prepare sorting
      const sorting = args.input.sorting || [];

      const orderBy: Prisma.RouteOrderByWithRelationInput[] = sorting.length
        ? sorting.flatMap((sort): Prisma.RouteOrderByWithRelationInput[] => {
            return [{ [sort.id]: sort.desc ? 'desc' : 'asc' }, { id: 'asc' }];
          })
        : [{ updatedAt: 'desc' }, { id: 'asc' }];

      const regionId = args.input.regionId;

      // fetching routes with extra one, so to determine if there's more to fetch
      const routes = await ctx.prisma.route.findMany({
        take:
          direction === PaginationDirection.BACKWARD ? -(take + 1) : take + 1, // Fetch one extra wbOrder for determining `hasNextPage`
        cursor,
        skip: cursor ? 1 : undefined, // Skip the cursor
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
          regionId,
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
    async routes(_, { regionId }, ctx) {
      const routes = await ctx.prisma.route.findMany({
        where: {
          regionId,
          isActive: true,
        },
      });

      return routes;
    },
    async routeById(_, args, ctx) {
      const id = args.id;

      if (!id?.length) {
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
              throw new GraphQLError(
                `Маршрут с таким идентификатором \`${id}\` не найден.`,
              );
            }
          }
          console.log({ err });
          throw new GraphQLError('Unknown error!');
        });

      return route;
    },
  },
  Mutation: {
    async createRoute(_, args, ctx) {
      const {
        arrivalCityId,
        departureCityId,
        regionId,
        isActive,
        departureDate,
        price,
      } = args.input;

      const route = await ctx.prisma.route
        .create({
          data: {
            arrivalCityId,
            departureCityId,
            regionId,
            isActive,
            departureDate,
            price,
          },
        })
        .catch(error => {
          if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              throw new GraphQLError(
                `Маршрут с таким отправлением уже существует.`,
              );
            }
          }
          console.log({ error });
          throw new GraphQLError('Unknown error!');
        });

      return route;
    },
    async updateRoute(_, args, ctx) {
      const routeId = args.id;
      const {
        departureCityId,
        isActive,
        departureDate,
        arrivalCityId,
        regionId,
        price,
      } = args.input;

      const updatedRoute = ctx.prisma.route
        .update({
          where: {
            id: routeId,
          },
          data: {
            departureCityId,
            isActive,
            departureDate,
            arrivalCityId,
            regionId,
            price,
          },
        })
        .catch(error => {
          if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              throw new GraphQLError(
                `Маршрут с таким отправлением уже существует.`,
              );
            }
          }
          console.log({ error });
          throw new GraphQLError('Unknown error!');
        });

      return updatedRoute;
    },
  },
  Route: {
    region(parent, _, { loaders }) {
      return parent.regionId
        ? loaders.regionLoader.load(parent.regionId)
        : null;
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
  'Query.infiniteRoutes': [
    isAuthenticated(),
    hasRoles([Role.MANAGER, Role.ADMIN]),
  ],
  'Mutation.createRoute': [
    isAuthenticated(),
    hasRoles([Role.MANAGER, Role.ADMIN]),
  ],
};

export default composeResolvers(resolvers, resolversComposition);

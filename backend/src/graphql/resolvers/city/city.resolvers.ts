import {
  Resolvers,
  SearchTypeBookings,
  SearchTypeCities,
} from '@/graphql/__generated__/types';
import { City, Prisma, Role } from '@prisma/client';

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
    async cities(_, args, ctx) {
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
        const cursorOrder = await ctx.prisma.city.findUnique({
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

            cursor = { id: -1 }; // we guarantee cities are empty
          } else if (direction === PaginationDirection.BACKWARD) {
            const nextValidOrder = await ctx.prisma.city.findFirst({
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

      const searchType = Object.values(SearchTypeCities);
      const conditions: Prisma.CityWhereInput[] = [];

      if (searchType.includes(SearchTypeCities.Id)) {
        // Number.isFinite isn't a solution, something
        let queryAsBigInt = undefined;

        try {
          queryAsBigInt = query && BigInt(query) ? BigInt(query) : undefined;
        } catch (err) {
          queryAsBigInt = undefined;
        }

        conditions.push({ id: { equals: queryAsBigInt } });
      }
      if (searchType.includes(SearchTypeCities.Name)) {
        conditions.push({ name: { contains: query } });
      }

      // fetching cities with extra one, so to determine if there's more to fetch
      const cities = await ctx.prisma.city.findMany({
        take:
          direction === PaginationDirection.BACKWARD ? -(take + 1) : take + 1, // Fetch one extra wbOrder for determining `hasNextPage`
        cursor,
        skip: cursor ? 1 : undefined, // Skip the cursor wbOrder for the next/previous page
        where: {
          OR:
            query.length !== 0 && conditions.length > 0
              ? conditions
              : undefined,
        },
      });

      // If no results are retrieved, it means we've reached the end of the
      // pagination or because we stumble upon invalid cursor, so on the
      // client we just clearing `before` and `after` cursors to get first cities
      // forward pagination could have no cities at all,
      // or because cursor is set to `{ id: -1 }`, for backward pagination
      // the only thing would happen if only cities are empty!
      if (cities.length === 0) {
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
          ? cities.slice(1).reverse().slice(0, take) // For backward pagination, remove first item and take requested amount
          : cities.slice(0, take); // For forward/none pagination, just take requested amount

      const hasMore = cities.length > take;

      const startCursor = edges.length === 0 ? null : edges[0]?.id;
      const endCursor = edges.length === 0 ? null : edges.at(-1)?.id;

      // This is where the condition `edges.length < cities.length` comes into
      // play. If the length of the `edges` array is less than the length
      // of the `cities` array, it means that the extra wbOrder was fetched and
      // excluded from the `edges` array. That implies that there are more
      // cities available to fetch in the current pagination direction.
      const hasNextPage =
        direction === PaginationDirection.BACKWARD ||
        (direction === PaginationDirection.FORWARD && hasMore) ||
        (direction === PaginationDirection.NONE &&
          edges.length < cities.length);
      // /\
      // |
      // |
      // NOTE: This condition `edges.length < cities.length` is essentially
      // checking the same thing as `hasMore`, which is whether there are more
      // cities available to fetch. Therefore, you can safely replace
      // `edges.length < cities.length` with hasMore in the condition for
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
    async arrivalCities(_, { departureCityId }, { prisma }) {
      if (departureCityId === null) {
        return [];
      }

      const routes = await prisma.route.findMany({
        where: {
          departureCityId,
        },
        select: {
          arrivalCity: true,
        },
        distinct: ['arrivalCityId'],
      });

      return routes.map(route => route.arrivalCity);
    },
    async departureCities(_, __, { prisma }) {
      const currentDate = new Date();

      const cities = await prisma.city.findMany({
        where: {
          departureTrips: {
            some: {
              OR: [
                { departureDate: null }, // Include trips where departureDate is null
                { departureDate: { gte: currentDate } }, // Or trips with future departure dates
              ],
            },
          },
        },
        distinct: ['id'],
        include: {
          departureTrips: true,
        },
      });

      return cities;
    },
  },
  Mutation: {
    async createCity(_, { name }, ctx) {
      const city = await ctx.prisma.city.create({
        data: {
          name,
        },
      });

      return city;
    },
  },
  City: {
    async arrivalTrips(parent, _, { loaders }) {
      return loaders.arrivalTripsLoader.load(parent.id);
    },
    async departureTrips(parent, _, { loaders }) {
      return loaders.departureTripsLoader.load(parent.id);
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {};

export default composeResolvers(resolvers, resolversComposition);

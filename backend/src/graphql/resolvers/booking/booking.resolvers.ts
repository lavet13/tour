import { Resolvers, SearchTypeBookings } from '@/graphql/__generated__/types';
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
    async bookings(_, args, ctx) {
      const query = args.input.query?.trim();

      const status = args.input.status;
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
        const cursorOrder = await ctx.prisma.booking.findUnique({
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

            cursor = { id: -1 }; // we guarantee bookings are empty
          } else if (direction === PaginationDirection.BACKWARD) {
            const nextValidOrder = await ctx.prisma.booking.findFirst({
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

      const searchType = Object.values(SearchTypeBookings);
      const conditions: Prisma.BookingWhereInput[] = [];

      if (searchType.includes(SearchTypeBookings.Id)) {
        // Number.isFinite isn't a solution, something
        let queryAsBigInt = undefined;

        try {
          queryAsBigInt = query && BigInt(query) ? BigInt(query) : undefined;
        } catch (err) {
          queryAsBigInt = undefined;
        }

        conditions.push({ id: { equals: queryAsBigInt } });
      }
      if (searchType.includes(SearchTypeBookings.Phone)) {
        conditions.push({ phoneNumber: { contains: query } });
      }

      const sorting = args.input.sorting;
      const orderBy = sorting[0]
        ? { [sorting[0].id]: sorting[0].desc ? 'desc' : 'asc' }
        : [];

      // fetching bookings with extra one, so to determine if there's more to fetch
      const bookings = await ctx.prisma.booking.findMany({
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

          status,
        },
      });

      // If no results are retrieved, it means we've reached the end of the
      // pagination or because we stumble upon invalid cursor, so on the
      // client we just clearing `before` and `after` cursors to get first bookings
      // forward pagination could have no bookings at all,
      // or because cursor is set to `{ id: -1 }`, for backward pagination
      // the only thing would happen if only bookings are empty!
      if (bookings.length === 0) {
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
          ? bookings.slice(1).reverse().slice(0, take) // For backward pagination, remove first item and take requested amount
          : bookings.slice(0, take); // For forward/none pagination, just take requested amount

      const hasMore = bookings.length > take;

      const startCursor = edges.length === 0 ? null : edges[0]?.id;
      const endCursor = edges.length === 0 ? null : edges.at(-1)?.id;

      // This is where the condition `edges.length < bookings.length` comes into
      // play. If the length of the `edges` array is less than the length
      // of the `bookings` array, it means that the extra wbOrder was fetched and
      // excluded from the `edges` array. That implies that there are more
      // bookings available to fetch in the current pagination direction.
      const hasNextPage =
        direction === PaginationDirection.BACKWARD ||
        (direction === PaginationDirection.FORWARD && hasMore) ||
        (direction === PaginationDirection.NONE &&
          edges.length < bookings.length);
      // /\
      // |
      // |
      // NOTE: This condition `edges.length < bookings.length` is essentially
      // checking the same thing as `hasMore`, which is whether there are more
      // bookings available to fetch. Therefore, you can safely replace
      // `edges.length < bookings.length` with hasMore in the condition for
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
    async bookingById(_, args, ctx) {
      const id = args.id;

      const booking = await ctx.prisma.booking
        .findUnique({
          where: {
            id,
          },
        })
        .catch((err: unknown) => {
          if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === 'P2025') {
              throw new GraphQLError(`OrderWb with ID \`${id}\` not found.`);
            }
          }
          console.log({ err });
          throw new GraphQLError('Unknown error!');
        });

      return booking;
    },
  },
  Mutation: {
    async createBooking(_, args, ctx) {
      const {
        routeId,
        departureCityId,
        arrivalCityId,
        ...rest
      } = args.input;

      const route = await ctx.prisma.route.findFirst({
        where: {
          id: routeId,
          departureCityId,
          arrivalCityId,
        },
      });

      if (!route) {
        throw new GraphQLError('Неверный маршрут, указанный для бронирования.');
      }

      const booking = await ctx.prisma.booking.create({
        data: {
          routeId,
          ...rest
        },
      });

      return booking;
    },
  },
  Booking: {
    route(parent, _, { loaders }) {
      return loaders.routeLoader.load(parent.routeId);
    },
  },
  Subscription: {
    createdBook: {
      subscribe: (_, args, ctx) => ctx.pubSub.subscribe('createdBook'),
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {
  'Query.bookings': [isAuthenticated(), hasRoles([Role.MANAGER, Role.ADMIN])],
  'Query.bookingById': [
    isAuthenticated(),
    hasRoles([Role.MANAGER, Role.ADMIN]),
  ],
  // 'Subscription.newWbOrder': [
  //   isAuthenticated(),
  //   hasRoles([Role.MANAGER, Role.ADMIN]),
  // ],
};

export default composeResolvers(resolvers, resolversComposition);

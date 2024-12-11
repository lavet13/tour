import { Resolvers, SearchTypeBookings } from '@/graphql/__generated__/types';
import { BookingStatus, Prisma, Role } from '@prisma/client';

import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { GraphQLError } from 'graphql';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { applyConstraints } from '@/helpers/apply-constraints';
import { hasRoles, isAuthenticated } from '@/graphql/composition/authorization';
import { inspect } from 'util';
import { parseIntSafe } from '@/helpers/parse-int-safe';

const resolvers: Resolvers = {
  Query: {
    async bookings(_, args, ctx) {
      const query = args.input.query?.trim();

      const columnFilters = args.input.columnFilters;

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
          : {
              id:
                direction === PaginationDirection.FORWARD
                  ? (args.input.after ?? undefined)
                  : (args.input.before ?? undefined),
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
            // Instead of setting cursor to { id: -1 }, set it to undefined
            // or use a method to get the first valid booking

            cursor = undefined; // we guarantee bookings are empty
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

      const conditions: Prisma.BookingWhereInput[] = columnFilters
        .map(filter => {
          if (filter?.id === 'seatsCount' && Array.isArray(filter.value)) {
            //@ts-ignore
            const [min, max] = filter.value.map(v =>
              v !== null ? parseIntSafe(v) : null,
            );

            return {
              seatsCount: {
                gte: min ?? undefined,
                lte: max ?? undefined,
              },
            };
          }

          if (
            filter?.id === 'createdAt' ||
            filter?.id === 'updatedAt' ||
            filter?.id === 'travelDate'
          ) {
            const [from, to] = filter.value;

            return {
              [filter.id]: {
                gte: from || undefined,
                lte: to || undefined,
              },
            };
          }

          const operator = filter?.id === 'status' ? 'equals' : 'contains';
          const value = filter?.value?.[0]; // just a value

          return {
            [filter?.id as string]: {
              [operator]: value,
              ...(operator === 'contains' ? { mode: 'insensitive' } : {}),
            },
          };
        })
        .filter(Boolean);

      // Prepare sorting
      const sorting = args.input.sorting || [];

      const orderBy: Prisma.BookingOrderByWithRelationInput[] = sorting.length
        ? sorting.flatMap((sort): Prisma.BookingOrderByWithRelationInput[] => {
            if (sort.id === 'status' || sort.id === 'commentary') {
              return [{ [sort.id]: sort.desc ? 'asc' : 'desc' }, { id: 'asc' }];
            }
            return [{ [sort.id]: sort.desc ? 'desc' : 'asc' }, { id: 'asc' }];
          })
        : [{ status: 'asc' }, { updatedAt: 'desc' }, { id: 'asc' }];

      // fetching bookings with extra one, so to determine if there's more to fetch
      const bookings = await ctx.prisma.booking.findMany({
        take:
          direction === PaginationDirection.BACKWARD ? -(take + 1) : take + 1, // Fetch one extra wbOrder for determining `hasNextPage`
        cursor,
        skip: cursor ? 1 : undefined, // Skip the cursor wbOrder for the next/previous page
        orderBy,
        where: {
          AND: conditions.length > 0 ? conditions : undefined,
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

      const edges =
        bookings.length <= take
          ? bookings
          : direction === PaginationDirection.BACKWARD
            ? bookings.slice(1, bookings.length)
            : bookings.slice(0, -1);

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
      const { departureCityId, arrivalCityId, ...rest } = args.input;

      const route = await ctx.prisma.route.findFirst({
        where: {
          departureCityId,
          arrivalCityId,
        },
      });

      if (!route) {
        throw new GraphQLError(
          'Неверный/Несуществующий маршрут, указанный для бронирования.',
        );
      }

      const booking = await ctx.prisma.booking.create({
        data: {
          routeId: route.id,
          ...rest,
        },
      });

      return booking;
    },
    async updateBookingStatus(_, args, ctx) {
      const id = args.input.id;
      const status = args.input.status;

      const isBookingExist = await ctx.prisma.booking.findUnique({
        where: {
          id,
        },
      });

      if(!isBookingExist) {
        throw new GraphQLError('Данного бронирования не существует!');
      }

      const updatedBooking = await ctx.prisma.booking.update({
        data: {
          status,
        },
        where: {
          id,
        },
      });

      return updatedBooking;
    }
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

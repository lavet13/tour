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
import { parseIntSafe } from '@/helpers/parse-int-safe';

const resolvers: Resolvers = {
  Query: {
    async bookings(_, args, ctx) {
      type BookingColumns = Exclude<
        keyof Prisma.BookingWhereInput,
        'AND' | 'OR' | 'NOT'
      >;

      const globalFilterableColumns = [
        'lastName',
        'firstName',
        'phoneNumber',
        'seatsCount',
      ] as const satisfies BookingColumns[];

      // const query = args.input.query?.trim();

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

      const columnConditions: Prisma.BookingWhereInput[] = columnFilters
        .map(filter => {
          if (filter?.id === 'route') {
            const value = filter.value?.[0] ?? '';

            return {
              [filter?.id as string]: {
                OR: [
                  {
                    arrivalCity: {
                      name: { contains: value, mode: 'insensitive' },
                    },
                  },
                  {
                    departureCity: {
                      name: { contains: value, mode: 'insensitive' },
                    },
                  },
                ],
              },
            };
          }

          if (filter?.id === 'seatsCount' && Array.isArray(filter.value)) {
            //@ts-ignore
            const [min, max] = filter.value.map(v =>
              v !== null ? parseIntSafe(v as string) : null,
            );

            return {
              [filter.id]: { gte: min ?? undefined, lte: max ?? undefined },
            };
          }

          if (
            filter?.id &&
            ['createdAt', 'updatedAt', 'travelDate'].includes(filter.id)
          ) {
            const [from, to] = filter.value;

            return {
              [filter.id]: { gte: from ?? undefined, lte: to ?? undefined },
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

      console.log({ columnConditions });

      // const globalCondition = query
      //   ? {
      //       OR: globalFilterableColumns.map(column => {
      //         if (column === 'seatsCount' as string) {
      //           return {
      //             seatsCount: { gte: parseIntSafe(query) ?? undefined },
      //           };
      //         }
      //
      //         return {
      //           [column]: { contains: query, mode: 'insensitive' },
      //         };
      //       }),
      //     }
      //   : undefined;

      // Apply fuzzy matching for `query`
      const conditions = {
        AND: [
          // ...(globalCondition ? [globalCondition] : []),
          ...(columnConditions.length > 0 ? columnConditions : []),
        ],
      };

      // Prepare sorting
      const sorting = args.input.sorting || [];

      const orderBy: Prisma.BookingOrderByWithRelationInput[] = sorting.length
        ? sorting.flatMap((sort): Prisma.BookingOrderByWithRelationInput[] => {
            if (sort.id === 'status') {
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
        where: conditions,
      });

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

      const hasNextPage =
        direction === PaginationDirection.BACKWARD ||
        (direction === PaginationDirection.FORWARD && hasMore) ||
        (direction === PaginationDirection.NONE &&
          edges.length < bookings.length);

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
              throw new GraphQLError(`Booking with ID \`${id}\` not found.`);
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
      const { notifyNewBooking } = ctx.telegramBot;
      const { departureCityId, arrivalCityId, telegramId, ...rest } =
        args.input;

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

      const booking = await ctx.prisma.booking.create({
        data: {
          routeId: route.id,
          telegramId,
          ...rest,
        },
      });

      try {
        // Notify managers using the functional service
        await notifyNewBooking(booking, ctx.prisma);

        // Optionally publish to subscription
        ctx.pubSub.publish('createdBooking', { createdBooking: booking });
      } catch (error) {
        // Log error but don't fail the booking creation
        console.error('Failed to send Telegram notification:', error);
      }

      return booking;
    },
    async updateBooking(_, args, ctx) {
      const {
        id,
        status,
        lastName,
        firstName,
        seatsCount,
        travelDate,
        phoneNumber,
        extraPhoneNumber,
      } = args.input;

      const isBookingExist = await ctx.prisma.booking.findUnique({
        where: {
          id,
        },
      });

      if (!isBookingExist) {
        throw new GraphQLError('Данного бронирования не существует!');
      }

      const updatedBooking = await ctx.prisma.booking.update({
        data: {
          status,
          phoneNumber,
          extraPhoneNumber,
          travelDate,
          seatsCount,
          firstName,
          lastName,
        },
        where: {
          id,
        },
      });

      return updatedBooking;
    },
  },
  Booking: {
    route(parent, _, { loaders }) {
      return loaders.routeLoader.load(parent.routeId);
    },
  },
  Subscription: {
    createdBooking: {
      subscribe: (_, args, ctx) => ctx.pubSub.subscribe('createdBooking'),
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {
  'Query.bookings': [isAuthenticated(), hasRoles([Role.MANAGER, Role.ADMIN])],
  'Query.bookingById': [
    isAuthenticated(),
    hasRoles([Role.MANAGER, Role.ADMIN]),
  ],
  'Mutation.updateBookingStatus': [
    isAuthenticated(),
    hasRoles([Role.MANAGER, Role.ADMIN]),
  ],
  'Subscription.createdBooking': [
    isAuthenticated(),
    hasRoles([Role.MANAGER, Role.ADMIN]),
  ],
};

export default composeResolvers(resolvers, resolversComposition);

import { InfiniteBookingsQuery } from '@/gql/graphql';
import { graphql } from '@/gql';
import { client } from '@/graphql/graphql-request';
import { useInfiniteQuery } from '@tanstack/react-query';
import { InitialDataInfiniteOptions } from '@/react-query/types/initial-data-infinite-options';
import { useNavigate } from 'react-router-dom';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { ColumnFiltersState, SortingState } from '@tanstack/react-table';

type TPageParam = {
  after: string | null;
};

type UseInfiniteBookingsProps = {
  take?: number;
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  options?: InitialDataInfiniteOptions<InfiniteBookingsQuery, TPageParam>;
};

export const useInfiniteBookings = ({
  take = 30,
  sorting = [],
  columnFilters = [],
  options,
}: UseInfiniteBookingsProps) => {
  const navigate = useNavigate();

  const bookings = graphql(`
    query InfiniteBookings($input: BookingsInput!) {
      bookings(input: $input) {
        edges {
          id
          firstName
          lastName
          phoneNumber
          travelDate
          seatsCount
          commentary
          route {
            id
            arrivalCity {
              name
            }
            departureCity {
              name
            }
          }
          status
          createdAt
          updatedAt
        }
        pageInfo {
          endCursor
          hasNextPage

          startCursor
          hasPreviousPage
        }
      }
    }
  `);

  return useInfiniteQuery({
    queryKey: [
      (bookings.definitions[0] as any).name.value,
      { input: { take, sorting, columnFilters } },
    ],
    queryFn: async ({ pageParam }) => {
      try {
        const transformedFilters = columnFilters.map(filter => ({
          id: filter.id,
          value: filter.value as string[],
        }));

        return await client.request(bookings, {
          input: {
            take,
            after: pageParam.after,
            sorting,
            columnFilters: transformedFilters,
          },
        });
      } catch (error) {
        if (
          isGraphQLRequestError(error) &&
          error.response.errors?.[0].extensions?.code === 'UNAUTHENTICATED'
        ) {
          navigate('/');
        }

        throw error;
      }
    },
    maxPages: 2,
    getNextPageParam: lastPage => {
      return lastPage.bookings.pageInfo.hasNextPage
        ? { after: lastPage.bookings.pageInfo.endCursor ?? null }
        : undefined;
    },
    initialPageParam: { after: null },
    meta: {
      toastEnabled: true,
    },
    ...options,
  });
};

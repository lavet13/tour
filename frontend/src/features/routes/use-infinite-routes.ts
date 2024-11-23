import { InfiniteRoutesQuery } from '@/gql/graphql';
import { graphql } from '@/gql';
import { client } from '@/graphql/graphql-request';
import { useInfiniteQuery } from '@tanstack/react-query';
import { InitialDataInfiniteOptions } from '@/types/initial-data-infinite-options';
import { useNavigate } from 'react-router-dom';
import { isGraphQLRequestError } from '@/types/is-graphql-request-error';
import { SortingState } from '@tanstack/react-table';

type TPageParam = {
  after: number | null;
};

type UseInfiniteRoutesProps = {
  take: number;
  query: string;
  sorting: SortingState;
  options?: InitialDataInfiniteOptions<InfiniteRoutesQuery, TPageParam>;
};

export const useInfiniteRoutes = ({
  query,
  take = 30,
  sorting = [],
  options,
}: UseInfiniteRoutesProps) => {
  const navigate = useNavigate();

  const routes = graphql(`
    query InfiniteRoutes($input: RoutesInput!) {
      routes(input: $input) {
        edges {
          id
          price
          departureCity {
            id
            name
          }
          region {
            id
            name
          }
          arrivalCity {
            id
            name
          }
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
      (routes.definitions[0] as any).name.value,
      { input: { take, query, sorting } },
    ],
    queryFn: async ({ pageParam }) => {
      try {
        return await client.request(routes, {
          input: {
            query,
            take,
            after: pageParam.after,
            sorting,
          },
        });
      } catch (error) {
        if (
          isGraphQLRequestError(error) &&
          error.response.errors?.[0].extensions.code === 'UNAUTHENTICATED'
        ) {
          navigate('/');
        }

        throw error;
      }
    },
    getNextPageParam: lastPage => {
      return lastPage.routes.pageInfo.hasNextPage
        ? { after: lastPage.routes.pageInfo.endCursor }
        : undefined;
    },
    initialPageParam: { after: null },
    meta: {
      toastEnabled: true,
    },
    ...options,
  });
};

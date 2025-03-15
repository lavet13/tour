import { graphql } from '@/gql';
import { GetRouteByIdQuery, GetRoutesQuery } from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

import { InfiniteRoutesQuery } from '@/gql/graphql';
import { useInfiniteQuery } from '@tanstack/react-query';
import { InitialDataInfiniteOptions } from '@/react-query/types/initial-data-infinite-options';
import { useNavigate } from 'react-router-dom';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { SortingState } from '@tanstack/react-table';

export const useRouteById = (
  id: string | null,
  options?: InitialDataOptions<GetRouteByIdQuery>,
) => {
  const routeById = graphql(`
    query GetRouteById($id: ID) {
      routeById(id: $id) {
        id
        departureCity {
          id
          name
        }
        arrivalCity {
          id
          name
        }
        region {
          id
          name
        }
        isActive
        departureDate
        price
      }
    }
  `);

  return useQuery({
    queryKey: [(routeById.definitions[0] as any).name.value, { id }],
    queryFn: async () => {
      return await client.request(routeById, { id });
    },
    meta: {
      toastEnabled: false,
    },
    retry: false,
    ...options,
  });
};

type TPageParam = {
  after: string | null;
};

type UseInfiniteRoutesProps = {
  take?: number;
  initialLoading?: boolean;
  query?: string;
  sorting?: SortingState;
  options?: InitialDataInfiniteOptions<InfiniteRoutesQuery, TPageParam>;
  regionId?: string | null;
};

export const useInfiniteRoutes = ({
  query = '',
  initialLoading = false,
  take = 30,
  sorting = [],
  options = {},
  regionId,
}: UseInfiniteRoutesProps) => {
  const navigate = useNavigate();

  const infiniteRoutes = graphql(`
    query InfiniteRoutes($input: RoutesInput!) {
      infiniteRoutes(input: $input) {
        edges {
          id
          departureCity {
            id
            name
          }
          region {
            id
            name
          }
          price
          isActive
          departureDate
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
      (infiniteRoutes.definitions[0] as any).name.value,
      { input: { take, query, sorting, regionId } },
    ],
    queryFn: async ({ pageParam }) => {
      try {
        // We only want initialLoading to be true for the first request
        // For subsequent requests (when using "load more"), it should be false
        const isFirstPage = pageParam.after === null;

        const data = await client.request(infiniteRoutes, {
          input: {
            query,
            initialLoading: isFirstPage && initialLoading,
            take,
            after: pageParam.after,
            sorting,
            regionId: regionId ?? null,
          },
        });

        return data;
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
    getNextPageParam: lastPage => {
      return lastPage.infiniteRoutes.pageInfo.hasNextPage
        ? { after: lastPage.infiniteRoutes.pageInfo.endCursor ?? null }
        : undefined;
    },
    maxPages: 10,
    initialPageParam: { after: null },
    meta: {
      toastEnabled: true,
    },
    ...options,
  });
};

export const useRoutes = (
  regionId: string,
  options?: InitialDataOptions<GetRoutesQuery>,
) => {
  const routes = graphql(`
    query GetRoutes($regionId: ID!) {
      routes(regionId: $regionId) {
        id
        departureCity {
          id
          name
        }
        arrivalCity {
          id
          name
        }
        departureDate
      }
    }
  `);

  return useQuery({
    queryKey: [(routes.definitions[0] as any).name.value, { regionId }],
    queryFn: async () => {
      return await client.request(routes, { regionId });
    },
    meta: {
      toastEnabled: false,
    },
    retry: false,
    ...options,
  });
};

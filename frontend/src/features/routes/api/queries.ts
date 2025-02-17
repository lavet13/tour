import { graphql } from '@/gql';
import { GetRoutesByRegionQuery, GetRouteByIdQuery } from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

import { InfiniteRoutesQuery } from '@/gql/graphql';
import { useInfiniteQuery } from '@tanstack/react-query';
import { InitialDataInfiniteOptions } from '@/react-query/types/initial-data-infinite-options';
import { useNavigate } from 'react-router-dom';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { SortingState } from '@tanstack/react-table';

export const useRoutesByRegion = (
  regionId: string,
  options?: InitialDataOptions<GetRoutesByRegionQuery>,
) => {
  const routesByRegion = graphql(`
    query GetRoutesByRegion($regionId: ID!) {
      routesByRegion(regionId: $regionId) {
        id
        name
        departureTrips(regionId: $regionId) {
          id
          arrivalCity {
            id
            name
          }
          departureDate
        }
      }
    }
  `);

  return useQuery<GetRoutesByRegionQuery>({
    queryKey: [(routesByRegion.definitions[0] as any).name.value, { regionId }],
    queryFn: async () => {
      return await client.request(routesByRegion, { regionId });
    },
    meta: {
      toastEnabled: false,
    },
    retry: false,
    ...options,
  });
};

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
  query?: string;
  sorting?: SortingState;
  options?: InitialDataInfiniteOptions<InfiniteRoutesQuery, TPageParam>;
};

export const useInfiniteRoutes = ({
  query = '',
  take = 30,
  sorting = [],
  options = {},
}: UseInfiniteRoutesProps) => {
  const navigate = useNavigate();

  const routes = graphql(`
    query InfiniteRoutes($input: RoutesInput!) {
      routes(input: $input) {
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
          error.response.errors?.[0].extensions?.code === 'UNAUTHENTICATED'
        ) {
          navigate('/');
        }

        throw error;
      }
    },
    getNextPageParam: lastPage => {
      return lastPage.routes.pageInfo.hasNextPage
        ? { after: lastPage.routes.pageInfo.endCursor ?? null }
        : undefined;
    },
    initialPageParam: { after: null },
    meta: {
      toastEnabled: true,
    },
    ...options,
  });
};

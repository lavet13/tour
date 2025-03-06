import { graphql } from '@/gql';
import {
  GetRouteByIdQuery,
  GetRoutesQuery,
} from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

import { InfiniteRoutesQuery } from '@/gql/graphql';
import { useInfiniteQuery } from '@tanstack/react-query';
import { InitialDataInfiniteOptions } from '@/react-query/types/initial-data-infinite-options';
import { useNavigate } from 'react-router-dom';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { SortingState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

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
  initialTake?: number;
  query?: string;
  sorting?: SortingState;
  options?: InitialDataInfiniteOptions<InfiniteRoutesQuery, TPageParam>;
  regionId?: string | null;
};

export const useInfiniteRoutes = ({
  query = '',
  initialTake = 5,
  take = 30,
  sorting = [],
  options = {},
  regionId,
}: UseInfiniteRoutesProps) => {
  const navigate = useNavigate();
  const [hasInitialized, setHasInitialized] = useState(false);

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

  const result = useInfiniteQuery({
    queryKey: [
      (infiniteRoutes.definitions[0] as any).name.value,
      { input: { take, query, sorting, regionId } },
    ],
    queryFn: async ({ pageParam }) => {
      try {
        // Use the appropriate take value based on initialization state
        const currentTake = hasInitialized ? take : initialTake;

        return await client.request(infiniteRoutes, {
          input: {
            query,
            take: currentTake,
            after: pageParam.after,
            sorting,
            regionId: regionId ?? null,
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
    maxPages: 10,
    getNextPageParam: lastPage => {
      return lastPage.infiniteRoutes.pageInfo.hasNextPage
        ? { after: lastPage.infiniteRoutes.pageInfo.endCursor ?? null }
        : undefined;
    },
    initialPageParam: { after: null },
    meta: {
      toastEnabled: true,
    },
    ...options,
  });

  // Mark as initialized after the first successful fetch
  useEffect(() => {
    if (result.data && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [result.data, hasInitialized]);

  return result;
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

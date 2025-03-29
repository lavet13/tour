import { graphql } from '@/gql';
import {
  GetRouteByIdsQuery,
  GetRouteByIdQuery,
  GetRoutesGalleryQuery,
  GetRoutesQuery,
} from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { InfiniteRoutesQuery } from '@/gql/graphql';
import { useInfiniteQuery } from '@tanstack/react-query';
import { InitialDataInfiniteOptions } from '@/react-query/types/initial-data-infinite-options';
import { useNavigate } from 'react-router-dom';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { SortingState } from '@tanstack/react-table';

type UseRouteByIdsProps = {
  departureCityId?: string;
  arrivalCityId?: string;
  options?: InitialDataOptions<GetRouteByIdsQuery>;
};

export const useRouteByIds = ({
  departureCityId,
  arrivalCityId,
  options = {},
}: UseRouteByIdsProps) => {
  const routeByIds = graphql(`
    query GetRouteByIds($departureCityId: ID, $arrivalCityId: ID) {
      routeByIds(
        departureCityId: $departureCityId
        arrivalCityId: $arrivalCityId
      ) {
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
        photo
      }
    }
  `);

  return useQuery({
    queryKey: [
      (routeByIds.definitions[0] as any).name.value,
      { departureCityId, arrivalCityId },
    ],
    queryFn: async () => {
      return await client.request(routeByIds, {
        departureCityId,
        arrivalCityId,
      });
    },
    meta: {
      toastEnabled: false,
    },
    retry: false,
    ...options,
  });
};

type UseRouteByIdProps = {
  id: string | null,
  options?: InitialDataOptions<GetRouteByIdQuery>,
};

export const useRouteById = ({
  id,
  options = {},
}: UseRouteByIdProps) => {
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
        photo
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
  regionIds: string[];
  departureCityId?: string | null;
  arrivalCityId?: string | null;
  includeInactiveRegions?: boolean;
  includeInactiveCities?: boolean;
};

export const useInfiniteRoutes = ({
  query,
  initialLoading = false,
  take = 30,
  sorting = [],
  options = {},
  regionIds,
  departureCityId,
  arrivalCityId,
  includeInactiveRegions,
  includeInactiveCities,
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
          photo
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
      {
        input: {
          take,
          query,
          sorting,
          regionIds,
          departureCityId,
          arrivalCityId,
          includeInactiveRegions,
          includeInactiveCities,
        },
      },
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
            regionIds,
            departureCityId,
            arrivalCityId,
            includeInactiveRegions,
            includeInactiveCities,
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

type UseRoutesGalleryProps = {
  limit?: number;
  offset?: number;
  options?: InitialDataOptions<GetRoutesGalleryQuery>;
};

export const useRoutesGallery = ({
  limit = 20,
  offset = 0,
  options = {},
}: UseRoutesGalleryProps) => {
  const routesGallery = graphql(`
    query GetRoutesGallery($limit: Int, $offset: Int) {
      routesGallery(limit: $limit, offset: $offset) {
        totalCount
        images
      }
    }
  `);

  return useQuery({
    queryKey: [
      (routesGallery.definitions[0] as any).name.value,
      { limit, offset },
    ],
    queryFn: async () => {
      return await client.request(routesGallery, { limit, offset });
    },
    meta: {
      toastEnabled: false,
    },
    retry: false,
    placeholderData: keepPreviousData,
    ...options,
  });
};

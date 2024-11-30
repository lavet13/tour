import { graphql } from '@/gql';
import { GetRegionForRouteQuery } from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

export const useRegionForRoute = (
  departureCityId?: string,
  arrivalCityId?: string,
  options?: InitialDataOptions<GetRegionForRouteQuery>
) => {
  const regionForRoute = graphql(`
    query GetRegionForRoute($departureCityId: ID, $arrivalCityId: ID) {
      regionForRoute(departureCityId: $departureCityId, arrivalCityId: $arrivalCityId) {
        id
        name
      }
    }
  `);

  return useQuery({
    queryKey: [(regionForRoute.definitions[0] as any).name.value, { departureCityId, arrivalCityId }],
    queryFn: async () => {
      return await client.request(regionForRoute, { departureCityId, arrivalCityId });
    },
    meta: {
      toastEnabled: false,
    },
    retry: false,
    ...options,
  });
};


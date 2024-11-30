import { graphql } from '@/gql';
import { GetRoutesByRegionQuery } from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

export const useRoutesByRegion = (
  regionId: string,
  options?: InitialDataOptions<GetRoutesByRegionQuery>,
) => {
  const routesByRegion = graphql(`
    query GetRoutesByRegion($regionId: ID!) {
      routesByRegion(regionId: $regionId) {
        id
        name
        departureTrips {
          id
          price
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

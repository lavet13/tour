import { graphql } from '@/gql';
import { RoutesByRegionQuery } from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

export const useRoutesByRegion = (
  regionId: String,
  options?: InitialDataOptions<RoutesByRegionQuery>,
) => {
  const routesByRegion = graphql(`
    query RoutesByRegion($regionId: BigInt!) {
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

  return useQuery<RoutesByRegionQuery>({
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

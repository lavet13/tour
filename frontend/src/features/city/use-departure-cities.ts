import { graphql } from '@/gql';
import { GetDepartureCitiesQuery } from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

export const useDepartureCities = (
  regionId?: string,
  options?: InitialDataOptions<GetDepartureCitiesQuery>
) => {
  const departureCities = graphql(`
    query GetDepartureCities($regionId: ID) {
      departureCities(regionId: $regionId) {
        id
        name
      }
    }
  `);

  return useQuery({
    queryKey: [(departureCities.definitions[0] as any).name.value, { regionId }],
    queryFn: async () => {
      return await client.request(departureCities, { regionId });
    },
    meta: {
      toastEnabled: true,
    },
    retry: false,
    ...options,
  });
};



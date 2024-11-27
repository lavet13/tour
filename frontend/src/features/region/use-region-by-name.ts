import { graphql } from '@/gql';
import { RegionByNameQuery } from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

export const useRegionByName = (
  regionName: string,
  options?: InitialDataOptions<RegionByNameQuery>
) => {
  const regionByName = graphql(`
    query RegionByName($regionName: String!) {
      regionByName(regionName: $regionName) {
        id
        name
      }
    }
  `);

  return useQuery<RegionByNameQuery>({
    queryKey: [(regionByName.definitions[0] as any).name.value, { regionName }],
    queryFn: async () => {
      return await client.request(regionByName, { regionName });
    },
    meta: {
      toastEnabled: false,
    },
    retry: false,
    ...options,
  });
};


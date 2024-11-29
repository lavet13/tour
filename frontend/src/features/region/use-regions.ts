import { graphql } from '@/gql';
import { RegionsQuery } from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

export const useRoutesByRegion = (
  options?: InitialDataOptions<RegionsQuery>,
) => {
  const regions = graphql(`
    query Regions {
      regions {
        id
        name
      }
    }
  `);

  return useQuery({
    queryKey: [(regions.definitions[0] as any).name.value],
    queryFn: async () => {
      return await client.request(regions);
    },
    meta: {
      toastEnabled: false,
    },
    retry: false,
    ...options,
  });
};

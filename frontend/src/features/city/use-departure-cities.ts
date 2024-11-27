import { graphql } from '@/gql';
import { GetDepartureCitiesQuery } from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

export const useDepartureCities = (
  options?: InitialDataOptions<GetDepartureCitiesQuery>
) => {
  const departureCities = graphql(`
    query GetDepartureCities {
      departureCities {
        id
        name
      }
    }
  `);

  return useQuery({
    queryKey: [(departureCities.definitions[0] as any).name.value],
    queryFn: async () => {
      return await client.request(departureCities);
    },
    meta: {
      toastEnabled: true,
    },
    retry: false,
    ...options,
  });
};



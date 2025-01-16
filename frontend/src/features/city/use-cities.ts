import { graphql } from '@/gql';
import { GetCitiesQuery } from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

export const useCities = (
  options?: InitialDataOptions<GetCitiesQuery>
) => {
  const cities = graphql(`
    query GetCities {
      cities {
        id
        name
      }
    }
  `);

  return useQuery({
    queryKey: [(cities.definitions[0] as any).name.value],
    queryFn: async () => {
      return await client.request(cities);
    },
    meta: {
      toastEnabled: true,
    },
    retry: false,
    ...options,
  });
};


import { graphql } from '@/gql';
import { GetArrivalCitiesQuery } from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

export const useArrivalCities = (
  departureCityId: string,
  options?: InitialDataOptions<GetArrivalCitiesQuery>
) => {
  const arrivalCities = graphql(`
    query GetArrivalCities($departureCityId: BigInt!) {
      arrivalCities(departureCityId: $departureCityId) {
        id
        name
      }
    }
  `);

  return useQuery({
    queryKey: [(arrivalCities.definitions[0] as any).name.value, { departureCityId }],
    queryFn: async () => {
      return await client.request(arrivalCities, { departureCityId });
    },
    meta: {
      toastEnabled: true,
    },
    retry: false,
    ...options,
  });
};


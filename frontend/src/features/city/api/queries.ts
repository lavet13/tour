import { graphql } from '@/gql';
import {
  GetArrivalCitiesQuery,
  GetCitiesQuery,
  GetDepartureCitiesQuery,
} from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

export const useArrivalCities = (
  departureCityId: string,
  options?: InitialDataOptions<GetArrivalCitiesQuery>,
) => {
  const arrivalCities = graphql(`
    query GetArrivalCities($departureCityId: ID) {
      arrivalCities(departureCityId: $departureCityId) {
        id
        name
      }
    }
  `);

  return useQuery({
    queryKey: [
      (arrivalCities.definitions[0] as any).name.value,
      { departureCityId },
    ],
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

export const useCities = (options?: InitialDataOptions<GetCitiesQuery>) => {
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

export const useDepartureCities = (
  regionId?: string,
  options?: InitialDataOptions<GetDepartureCitiesQuery>,
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
    queryKey: [
      (departureCities.definitions[0] as any).name.value,
      { regionId },
    ],
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

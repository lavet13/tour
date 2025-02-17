import { graphql } from '@/gql';
import {
  RegionByNameQuery,
  GetRegionForRouteQuery,
  RegionsQuery,
} from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

export const useRegionByName = (
  regionName: string,
  options?: InitialDataOptions<RegionByNameQuery>,
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

export const useRegionForRoute = (
  departureCityId?: string,
  arrivalCityId?: string,
  options?: InitialDataOptions<GetRegionForRouteQuery>,
) => {
  const regionForRoute = graphql(`
    query GetRegionForRoute($departureCityId: ID, $arrivalCityId: ID) {
      regionForRoute(
        departureCityId: $departureCityId
        arrivalCityId: $arrivalCityId
      ) {
        id
        name
      }
    }
  `);

  return useQuery({
    queryKey: [
      (regionForRoute.definitions[0] as any).name.value,
      { departureCityId, arrivalCityId },
    ],
    queryFn: async () => {
      return await client.request(regionForRoute, {
        departureCityId,
        arrivalCityId,
      });
    },
    meta: {
      toastEnabled: false,
    },
    retry: false,
    ...options,
  });
};

export const useRegions = (options?: InitialDataOptions<RegionsQuery>) => {
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

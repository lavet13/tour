import { graphql } from "@/gql";
import {
  GetArrivalCitiesQuery,
  GetRouteByIdsQuery,
  GetCitiesQuery,
  GetDepartureCitiesQuery,
} from "@/gql/graphql";
import { client } from "@/graphql-request";
import { InitialDataOptions } from "@/react-query/types/initial-data-options";
import { useQuery } from "@tanstack/react-query";

type UseArrivalCitiesProps = {
  options?: InitialDataOptions<GetArrivalCitiesQuery>;
  cityId: string;
  includeInactiveCities?: boolean;
};

export const useArrivalCities = (props: UseArrivalCitiesProps) => {
  const { options = {}, cityId, includeInactiveCities } = props;

  const arrivalCities = graphql(`
    query GetArrivalCities($cityId: ID, $includeInactiveCities: Boolean) {
      arrivalCities(
        cityId: $cityId
        includeInactiveCities: $includeInactiveCities
      ) {
        id
        name
      }
    }
  `);

  return useQuery({
    queryKey: [
      (arrivalCities.definitions[0] as any).name.value,
      { cityId, includeInactiveCities },
    ],
    queryFn: async () => {
      return await client.request(arrivalCities, {
        cityId,
        includeInactiveCities,
      });
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

type UseDepartureCitiesProps = {
  options?: InitialDataOptions<GetDepartureCitiesQuery>;
  includeInactiveCities?: boolean;
};

export const useDepartureCities = (props: UseDepartureCitiesProps = {}) => {
  const { options = {}, includeInactiveCities } = props;

  const departureCities = graphql(`
    query GetDepartureCities($includeInactiveCities: Boolean) {
      departureCities(includeInactiveCities: $includeInactiveCities) {
        id
        name
      }
    }
  `);

  return useQuery({
    queryKey: [
      (departureCities.definitions[0] as any).name.value,
      { includeInactiveCities },
    ],
    queryFn: async () => {
      return await client.request(departureCities, { includeInactiveCities });
    },
    meta: {
      toastEnabled: true,
    },
    retry: false,
    ...options,
  });
};

type UseRouteByIdsProps = {
  departureCityId?: string;
  arrivalCityId?: string;
  options?: InitialDataOptions<GetRouteByIdsQuery>;
};

export const useRouteByIds = ({
  departureCityId,
  arrivalCityId,
  options = {},
}: UseRouteByIdsProps) => {
  const routeByIds = graphql(`
    query GetRouteByIds($departureCityId: ID, $arrivalCityId: ID) {
      routeByIds(
        departureCityId: $departureCityId
        arrivalCityId: $arrivalCityId
      ) {
        id
        departureCity {
          id
          name
          description
        }
        arrivalCity {
          id
          name
          description
        }
        region {
          id
          name
        }
        isActive
        departureDate
        price
        photoName
        direction
      }
    }
  `);

  return useQuery({
    queryKey: [
      (routeByIds.definitions[0] as any).name.value,
      { departureCityId, arrivalCityId },
    ],
    queryFn: async () => {
      return await client.request(routeByIds, {
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


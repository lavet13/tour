import { graphql } from '@/gql';
import {
  GetSchedulesByRouteQuery,
  GetScheduleByIdQuery,
  GetSchedulesByIdsQuery,
  RouteDirection,
} from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

type UseSchedulesByRoute = {
  options?: InitialDataOptions<GetSchedulesByRouteQuery>;
  routeId?: string;
  direction?: RouteDirection;
};

export const useSchedulesByRoute = ({
  routeId,
  direction,
  options = {},
}: UseSchedulesByRoute) => {
  const schedulesByRoute = graphql(`
    query GetSchedulesByRoute($routeId: ID, $direction: RouteDirection) {
      schedulesByRoute(routeId: $routeId, direction: $direction) {
        id
        direction
        stopName
        time
        isActive
        createdAt
        updatedAt
        city {
          id
          name
        }
      }
    }
  `);

  return useQuery({
    queryKey: [
      (schedulesByRoute.definitions[0] as any).name.value,
      { routeId },
    ],
    queryFn: async () => {
      return await client.request(schedulesByRoute, { routeId, direction });
    },
    meta: {
      toastEnabled: false,
    },
    retry: false,
    ...options,
  });
};

export const useScheduleById = (
  scheduleId: string | null,
  options?: InitialDataOptions<GetScheduleByIdQuery>,
) => {
  const scheduleById = graphql(`
    query GetScheduleById($scheduleId: ID) {
      scheduleById(scheduleId: $scheduleId) {
        id
        direction
        stopName
        time
        isActive
      }
    }
  `);

  return useQuery({
    queryKey: [(scheduleById.definitions[0] as any).name.value, { scheduleId }],
    queryFn: async () => {
      return await client.request(scheduleById, { scheduleId });
    },
    meta: {
      toastEnabled: false,
    },
    retry: false,
    ...options,
  });
};

type SchedulesByIdsProps = {
  departureCityId: string | null;
  arrivalCityId: string | null;
  options?: InitialDataOptions<GetSchedulesByIdsQuery>;
};

export const useSchedulesByIds = ({
  departureCityId,
  arrivalCityId,
  options = {},
}: SchedulesByIdsProps) => {
  const scheduleById = graphql(`
    query GetSchedulesByIds($departureCityId: ID, $arrivalCityId: ID) {
      schedulesByIds(
        departureCityId: $departureCityId
        arrivalCityId: $arrivalCityId
      ) {
        city {
          name
        }
        direction
        stopName
        time
        isActive
      }
    }
  `);

  return useQuery({
    queryKey: [
      (scheduleById.definitions[0] as any).name.value,
      { departureCityId, arrivalCityId },
    ],
    queryFn: async () => {
      return await client.request(scheduleById, {
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

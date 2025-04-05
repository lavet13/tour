import { graphql } from '@/gql';
import {
  GetSchedulesByRouteQuery,
  GetScheduleByIdQuery,
  GetSchedulesByIdsQuery,
} from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

export const useSchedulesByRoute = (
  routeId: string | null,
  options?: InitialDataOptions<GetSchedulesByRouteQuery>,
) => {
  const schedulesByRoute = graphql(`
    query GetSchedulesByRoute($routeId: ID) {
      schedulesByRoute(routeId: $routeId) {
        id
        direction
        stopName
        departureTime
        arrivalTime
        isActive
        createdAt
        updatedAt
      }
    }
  `);

  return useQuery({
    queryKey: [
      (schedulesByRoute.definitions[0] as any).name.value,
      { routeId },
    ],
    queryFn: async () => {
      return await client.request(schedulesByRoute, { routeId });
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
        departureTime
        arrivalTime
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
        direction
        stopName
        departureTime
        arrivalTime
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

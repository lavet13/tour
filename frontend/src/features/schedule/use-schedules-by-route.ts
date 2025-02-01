import { graphql } from '@/gql';
import { GetSchedulesByRouteQuery } from '@/gql/graphql';
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
        route {
          departureCity {
            id
            name
          }
          arrivalCity {
            id
            name
          }
        }
        dayOfWeek
        startTime
        endTime
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

import { graphql } from '@/gql';
import { GetRouteByIdQuery } from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { useQuery } from '@tanstack/react-query';

export const useRouteById = (
  id: string | null,
  options?: InitialDataOptions<GetRouteByIdQuery>,
) => {
  const routeById = graphql(`
    query GetRouteById($id: ID) {
      routeById(id: $id) {
        id
        departureCity {
          id
          name
        }
        arrivalCity {
          id
          name
        }
        region {
          id
          name
        }
        isActive
        departureDate
      }
    }
  `);

  return useQuery({
    queryKey: [(routeById.definitions[0] as any).name.value, { id }],
    queryFn: async () => {
      return await client.request(routeById, { id });
    },
    meta: {
      toastEnabled: false,
    },
    retry: false,
    ...options,
  });
};

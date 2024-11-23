import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { graphql } from '@/gql';
import { RoutesQuery } from '@/gql/graphql';
import { InitialDataOptions } from '@/types/initial-data-options';
import { client } from '@/graphql/graphql-request';

type UseRoutesProps = {
  take?: number;
  before?: number | null;
  after?: number | null;
};

export const useRoutes = (
  { take, after, before }: UseRoutesProps,
  options?: InitialDataOptions<RoutesQuery>
) => {
  const input: Record<string, any> = {};
  import.meta.env.DEV && console.log({ before, after });

  if (after !== null && after !== undefined) {
    input.after = after;
  }
  if (before !== null && before !== undefined) {
    input.before = before;
  }
  if (take !== undefined && take !== null) {
    input.take = take;
  }
  import.meta.env.DEV && console.log({ input });

  const routes = graphql(`
    query Routes($input: RoutesInput!) {
      routes(input: $input) {
        edges {
          id
        }
        pageInfo {
          endCursor
          hasNextPage

          startCursor
          hasPreviousPage
        }
      }
    }
  `);

  return useQuery({
    queryKey: [(routes.definitions[0] as any).name.value, { input }],
    queryFn: async () => {
      // await new Promise(resolve => setTimeout(() => resolve(0), 10000000));
      return await client.request(routes, { input });
    },
    placeholderData: keepPreviousData,
    ...options,
  });
};

import { SearchTypeWbOrders, WbOrdersQuery } from '@/gql/graphql';
import { graphql } from '@/gql';
import { client } from '@/graphql/graphql-request';
import { useInfiniteQuery } from '@tanstack/react-query';
import { InitialDataInfiniteOptions } from '@/types/initial-data-infinite-options';
import { useNavigate } from 'react-router-dom';
import { isGraphQLRequestError } from '@/types/is-graphql-request-error';
import { OrderStatus } from '@/gql/graphql';

type TPageParam = {
  after: number | null;
};

type UseInfiniteWbOrdersProps = {
  take: number;
  status?: OrderStatus | 'ALL';
  query: string;
  searchType?: SearchTypeWbOrders | 'ALL';
  options?: InitialDataInfiniteOptions<WbOrdersQuery, TPageParam>;
};

export const useInfiniteWbOrders = ({
  query,
  searchType = 'ALL',
  take = 30,
  status = 'ALL',
  options,
}: UseInfiniteWbOrdersProps) => {
  const navigate = useNavigate();

  const wbOrders = graphql(`
    query WbOrders($input: WbOrdersInput!) {
      wbOrders(input: $input) {
        edges {
          id
          name
          phone
          qrCode
          orderCode
          wbPhone
          status
          createdAt
          updatedAt
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

  return useInfiniteQuery({
    queryKey: [
      (wbOrders.definitions[0] as any).name.value,
      { input: { take, status, query, searchType } },
    ],
    queryFn: async ({ pageParam }) => {
      try {
        return await client.request(wbOrders, {
          input: {
            query,
            ...(searchType === 'ALL'
              ? { searchType: Object.values(SearchTypeWbOrders) }
              : { searchType: [searchType] }),
            take,
            after: pageParam.after,
            ...(status === 'ALL' ? {} : { status }),
          },
        });
      } catch (error) {
        if (
          isGraphQLRequestError(error) &&
          error.response.errors?.[0].extensions.code === 'UNAUTHENTICATED'
        ) {
          navigate('/');
        }

        throw error;
      }
    },
    getNextPageParam: lastPage => {
      return lastPage.wbOrders.pageInfo.hasNextPage
        ? { after: lastPage.wbOrders.pageInfo.endCursor }
        : undefined;
    },
    initialPageParam: { after: null },
    meta: {
      toastEnabled: false,
    },
    ...options,
  });
};

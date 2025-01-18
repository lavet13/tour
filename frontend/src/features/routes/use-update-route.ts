import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  UpdateRouteMutation,
  UpdateRouteMutationVariables,
} from '@/gql/graphql';
import { graphql } from '@/gql';
import { client } from '@/graphql/graphql-request';
import { client as queryClient } from '@/react-query';

export const useUpdateRoute = (
  options: UseMutationOptions<
    UpdateRouteMutation,
    Error,
    UpdateRouteMutationVariables
  > = {},
) => {
  const createBooking = graphql(`
    mutation UpdateRoute($id: ID!, $input: CreateRouteInput!) {
      updateRoute(id: $id, input: $input) {
        id
      }
    }
  `);

  return useMutation({
    mutationFn: (variables: UpdateRouteMutationVariables) => {
      return client.request(createBooking, {
        ...variables,
      });
    },
    onSettled(data) {
      const id = data?.updateRoute.id;

      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ['InfiniteRoutes'] }),
        queryClient.invalidateQueries({ queryKey: ['GetRouteById', { id }] }),
      ]);
    },
    ...options,
  });
};

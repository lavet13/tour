import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  UpdateRouteMutation,
  UpdateRouteMutationVariables,
  CreateRouteMutation,
  CreateRouteMutationVariables,
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
        region {
          id
        }
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
      const regionId = data?.updateRoute.region?.id ?? null;
      console.log({ regionId });

      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['InfiniteRoutes', { input: { regionId } }],
        }),
        queryClient.invalidateQueries({ queryKey: ['GetRouteById', { id }] }),
      ]);
    },
    ...options,
  });
};

export const useCreateRoute = (
  options: UseMutationOptions<
    CreateRouteMutation,
    Error,
    CreateRouteMutationVariables
  > = {},
) => {
  const createBooking = graphql(`
    mutation CreateRoute($input: CreateRouteInput!) {
      createRoute(input: $input) {
        id
        region {
          id
        }
      }
    }
  `);

  return {
    ...useMutation({
      mutationFn: (variables: CreateRouteMutationVariables) => {
        return client.request(createBooking, {
          ...variables,
        });
      },
      onSettled(data) {
        const regionId = data?.createRoute.region?.id ?? null;

        return queryClient.invalidateQueries({
          queryKey: ['InfiniteRoutes', { input: { regionId } }],
        });
      },
      ...options,
    }),
  };
};

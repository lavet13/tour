import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  CreateRouteMutation,
  CreateRouteMutationVariables,
} from '@/gql/graphql';
import { graphql } from '@/gql';
import { client } from '@/graphql/graphql-request';

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
      ...options,
    }),
  };
};


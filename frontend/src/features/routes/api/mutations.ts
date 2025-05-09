import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  UpdateRouteMutation,
  UpdateRouteMutationVariables,
  CreateRouteMutation,
  CreateRouteMutationVariables,
  UploadPhotoRouteMutation,
  UploadPhotoRouteMutationVariables,
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
  const updateRoute = graphql(`
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
      return client.request(updateRoute, {
        ...variables,
      });
    },
    onSettled(data) {
      const id = data?.updateRoute.id;
      const regionId = data?.updateRoute.region?.id ?? null;
      console.log({ regionId, routeId: id });

      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['InfiniteRoutes', { input: { regionIds: [regionId].filter(Boolean) } }],
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
  const createRoute = graphql(`
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
        return client.request(createRoute, {
          ...variables,
        });
      },
      onSettled(data) {
        const regionId = data?.createRoute.region?.id ?? null;

        return queryClient.invalidateQueries({
          queryKey: ['InfiniteRoutes', { input: { regionIds: [regionId].filter(Boolean) } }],
        });
      },
      ...options,
    }),
  };
};

export const useUploadPhotoRoute = (
  options: UseMutationOptions<
    UploadPhotoRouteMutation,
    Error,
    UploadPhotoRouteMutationVariables
  > = {},
) => {
  const uploadPhotoRoute = graphql(`
    mutation UploadPhotoRoute(
      $file: File!
      $isPhotoSelected: Boolean
      $routeId: ID!
    ) {
      uploadPhotoRoute(
        file: $file
        isPhotoSelected: $isPhotoSelected
        routeId: $routeId
      ) {
        photo
        routeId
        regionId
      }
    }
  `);

  return {
    ...useMutation({
      mutationFn: (variables: UploadPhotoRouteMutationVariables) => {
        return client.request(uploadPhotoRoute, {
          ...variables,
        });
      },
      onSettled(data) {
        const id = data?.uploadPhotoRoute.routeId;
        const regionId = data?.uploadPhotoRoute.regionId;

        return Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['InfiniteRoutes', { input: { regionIds: [regionId].filter(Boolean) } }],
          }),
          queryClient.invalidateQueries({ queryKey: ['GetRouteById', { id }] }),
        ]);
      },
      ...options,
    }),
  };
};

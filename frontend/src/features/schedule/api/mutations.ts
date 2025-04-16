import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  UpdateScheduleMutation,
  UpdateScheduleMutationVariables,
  CreateScheduleMutation,
  CreateScheduleMutationVariables,
  DeleteScheduleMutation,
  DeleteScheduleMutationVariables,
} from '@/gql/graphql';
import { graphql } from '@/gql';
import { client } from '@/graphql/graphql-request';
import { client as queryClient } from '@/react-query';

export const useUpdateSchedule = (
  options: UseMutationOptions<
    UpdateScheduleMutation,
    Error,
    UpdateScheduleMutationVariables
  > = {},
) => {
  const updateSchedule = graphql(`
    mutation UpdateSchedule($input: UpdateScheduleInput!) {
      updateSchedule(input: $input) {
        id
        route {
          id
        }
        isActive
        direction
        stopName
        time
        createdAt
        updatedAt
      }
    }
  `);

  return useMutation({
    mutationFn: (variables: UpdateScheduleMutationVariables) => {
      return client.request(updateSchedule, {
        ...variables,
      });
    },
    onSettled(data) {
      const id = data?.updateSchedule.id;
      const routeId = data?.updateSchedule.route?.id ?? null;

      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['GetSchedulesByRoute', { routeId }],
        }),
        queryClient.invalidateQueries({ queryKey: ['GetRouteById', { id }] }),
      ]);
    },
    ...options,
  });
};

export const useCreateSchedule = (
  options: UseMutationOptions<
    CreateScheduleMutation,
    Error,
    CreateScheduleMutationVariables
  > = {},
) => {
  const createSchedule = graphql(`
    mutation CreateSchedule($input: CreateScheduleInput!) {
      createSchedule(input: $input) {
        id
        route {
          id
        }
        isActive
        direction
        stopName
        time
        createdAt
        updatedAt
      }
    }
  `);

  return useMutation({
    mutationFn: (variables: CreateScheduleMutationVariables) => {
      return client.request(createSchedule, {
        ...variables,
      });
    },
    onSettled(data) {
      const routeId = data?.createSchedule.route?.id;

      return queryClient.invalidateQueries({
        queryKey: ['GetSchedulesByRoute', { routeId }],
      });
    },
    ...options,
  });
};

export const useDeleteSchedule = (
  options: UseMutationOptions<
    DeleteScheduleMutation,
    Error,
    DeleteScheduleMutationVariables
  > = {},
) => {
  const deleteSchedule = graphql(`
    mutation DeleteSchedule($id: ID!) {
      deleteSchedule(id: $id) {
        route {
          id
        }
      }
    }
  `);

  return useMutation({
    mutationFn: (variables: DeleteScheduleMutationVariables) => {
      return client.request(deleteSchedule, {
        ...variables,
      });
    },
    onSettled(data) {
      const routeId = data?.deleteSchedule.route?.id ?? null;

      return queryClient.invalidateQueries({
        queryKey: ['GetSchedulesByRoute', { routeId }],
      });
    },
    ...options,
  });
};

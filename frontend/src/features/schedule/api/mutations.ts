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
        isActive
        dayOfWeek
        startTime
        endTime
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
        isActive
        dayOfWeek
        startTime
        endTime
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
      deleteSchedule(id: $id)
    }
  `);

  return useMutation({
    mutationFn: (variables: DeleteScheduleMutationVariables) => {
      return client.request(deleteSchedule, {
        ...variables,
      });
    },
    ...options,
  });
};

import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  UpdateScheduleMutation,
  UpdateScheduleMutationVariables,
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

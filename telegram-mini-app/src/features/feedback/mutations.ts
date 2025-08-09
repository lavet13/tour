import { graphql } from '@/gql';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  CreateFeedbackMutation,
  CreateFeedbackMutationVariables,
} from '@/gql/graphql';
import { client } from '@/graphql-request';

export const useCreateFeedback = (
  options: UseMutationOptions<
    CreateFeedbackMutation,
    Error,
    CreateFeedbackMutationVariables
  > = {},
) => {
  const createBooking = graphql(`
    mutation CreateFeedback($input: CreateFeedbackInput!) {
      createFeedback(input: $input) {
        reason
        replyTo
        message
      }
    }
  `);

  return useMutation({
    mutationFn(variables: CreateFeedbackMutationVariables) {
      return client.request(createBooking, { ...variables });
    },
    ...options,
  });
};


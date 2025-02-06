import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  UpdateBookingMutation,
  UpdateBookingMutationVariables,
} from '@/gql/graphql';
import { graphql } from '@/gql';
import { client } from '@/graphql/graphql-request';

export const useUpdateBooking = (
  options: UseMutationOptions<
    UpdateBookingMutation,
    Error,
    UpdateBookingMutationVariables
  > = {},
) => {
  const updateBooking = graphql(`
    mutation UpdateBooking($input: UpdateBookingInput!) {
      updateBooking(input: $input) {
        id
        firstName
        lastName
        phoneNumber
        travelDate
        seatsCount
        commentary
        status
        createdAt
        updatedAt
      }
    }
  `);

  return useMutation({
    mutationFn: (variables: UpdateBookingMutationVariables) => {
      return client.request(updateBooking, {
        ...variables,
      });
    },
    ...options,
  });
};

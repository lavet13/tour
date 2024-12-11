import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  UpdateBookingStatusMutation,
  UpdateBookingStatusMutationVariables,
} from '@/gql/graphql';
import { graphql } from '@/gql';
import { client } from '@/graphql/graphql-request';
import { client as queryClient } from '@/react-query';

export const useUpdateBookingStatus = (
  options: UseMutationOptions<
    UpdateBookingStatusMutation,
    Error,
    UpdateBookingStatusMutationVariables
  > = {},
) => {
  const updateBookingStatus = graphql(`
    mutation UpdateBookingStatus($input: BookingStatusInput!) {
      updateBookingStatus(input: $input) {
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
    mutationFn: (variables: UpdateBookingStatusMutationVariables) => {
      return client.request(updateBookingStatus, {
        ...variables,
      });
    },
    ...options,
  });
};

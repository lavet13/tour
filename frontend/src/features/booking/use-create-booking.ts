import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  CreateBookingMutation,
  CreateBookingMutationVariables,
} from '@/gql/graphql';
import { graphql } from '@/gql';
import { client } from '@/graphql/graphql-request';

export const useCreateBooking = (
  options: UseMutationOptions<
    CreateBookingMutation,
    Error,
    CreateBookingMutationVariables
  > = {},
) => {
  const createBooking = graphql(`
    mutation CreateBooking($input: BookingInput!) {
      createBooking(input: $input) {
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

  return {
    ...useMutation({
      mutationFn: (variables: CreateBookingMutationVariables) => {
        return client.request(createBooking, {
          ...variables,
        });
      },
      ...options,
    }),
  };
};


import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  UpdateBookingMutation,
  UpdateBookingMutationVariables,
  CreateBookingMutation,
  CreateBookingMutationVariables,
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


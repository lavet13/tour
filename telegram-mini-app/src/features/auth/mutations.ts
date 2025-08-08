import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import {
  AuthenticateWithTmaMutation,
  AuthenticateWithTmaMutationVariables,
} from "@/gql/graphql";
import { graphql } from "@/gql";
import { client } from "@/graphql-request";

export const useAuthenticateTMA = (
  options?: UseMutationOptions<
    AuthenticateWithTmaMutation,
    Error,
    AuthenticateWithTmaMutationVariables
  >,
) => {
  const authenticateWithTMA = graphql(`
    mutation AuthenticateWithTma($input: TMAAuthInput!) {
      authenticateWithTma(input: $input) {
        isNewUser
        accessToken
        refreshToken
      }
    }
  `);

  return useMutation({
    mutationFn: (variables) => {
      return client.request(authenticateWithTMA, variables);
    },
    retry: false,
    ...options,
  });
};

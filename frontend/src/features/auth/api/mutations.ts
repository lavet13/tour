import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  LogoutMutation,
  RefreshTokenMutation,
  LoginMutation,
  LoginMutationVariables,
  RegisterMutation,
  RegisterMutationVariables,
} from '@/gql/graphql';
import { graphql } from '@/gql';
import { client } from '@/graphql/graphql-request';

export const useLogout = (options?: UseMutationOptions<LogoutMutation>) => {
  const logoutMutation = graphql(`
    mutation Logout {
      logout
    }
  `);

  return useMutation({
    mutationFn: () => {
      return client.request(logoutMutation);
    },
    ...options,
  });
};

export const useRefreshToken = (
  options?: UseMutationOptions<RefreshTokenMutation>,
) => {
  const refreshToken = graphql(`
    mutation RefreshToken {
      refreshToken {
        accessToken
        refreshToken
      }
    }
  `);

  return useMutation({
    mutationFn: () => {
      return client.request(refreshToken);
    },
    retry: false,
    ...options,
  });
};

export const useLogin = (
  options?: UseMutationOptions<LoginMutation, Error, LoginMutationVariables>,
) => {
  const login = graphql(`
    mutation Login($loginInput: LoginInput!) {
      login(loginInput: $loginInput) {
        accessToken
        refreshToken
      }
    }
  `);

  return useMutation({
    mutationFn: (variables: LoginMutationVariables) => {
      return client.request(login, variables);
    },
    ...options,
  });
};

export const useSignup = (
  options?: UseMutationOptions<
    RegisterMutation,
    Error,
    RegisterMutationVariables
  >,
) => {
  const register = graphql(`
    mutation Register($signupInput: SignupInput!) {
      signup(signupInput: $signupInput) {
        accessToken
        refreshToken
      }
    }
  `);

  return useMutation({
    mutationFn: (variables: RegisterMutationVariables) => {
      return client.request(register, variables);
    },
    ...options,
  });
};

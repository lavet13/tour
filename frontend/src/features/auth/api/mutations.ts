import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  LogoutMutation,
  RefreshTokenMutation,
  LoginMutation,
  LoginMutationVariables,
  UpdateTelegramChatIdsMutation,
  UpdateTelegramChatIdsMutationVariables,
  AuthenticateWithTelegramMutation,
  AuthenticateWithTelegramMutationVariables,
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
    mutationFn: variables => {
      return client.request(login, variables);
    },
    ...options,
  });
};

export const useAuthenticateTelegram = (
  options?: UseMutationOptions<
    AuthenticateWithTelegramMutation,
    Error,
    AuthenticateWithTelegramMutationVariables
  >,
) => {
  const authenticateWithTelegram = graphql(`
    mutation AuthenticateWithTelegram($input: TelegramAuthInput!) {
      authenticateWithTelegram(input: $input) {
        user {
          id
          email
          name
          telegram {
            id
            telegramId
            firstName
            lastName
            username
            photoUrl
            authDate
          }
        }
        isNewUser
        accessToken
        refreshToken
      }
    }
  `);

  return useMutation({
    mutationFn: variables => {
      return client.request(authenticateWithTelegram, variables);
    },
    retry: false,
    ...options,
  });
};

// export const useSignup = (
//   options?: UseMutationOptions<
//     RegisterMutation,
//     Error,
//     RegisterMutationVariables
//   >,
// ) => {
//   const register = graphql(`
//     mutation Register($signupInput: SignupInput!) {
//       signup(signupInput: $signupInput) {
//         accessToken
//         refreshToken
//       }
//     }
//   `);
//
//   return useMutation({
//     mutationFn: variables => {
//       return client.request(register, variables);
//     },
//     ...options,
//   });
// };

export const useUpdateTelegramChatIds = (
  options?: UseMutationOptions<
    UpdateTelegramChatIdsMutation,
    Error,
    UpdateTelegramChatIdsMutationVariables
  >,
) => {
  const register = graphql(`
    mutation UpdateTelegramChatIds($input: UpdateTelegramChatIdsInput!) {
      updateTelegramChatIds(input: $input)
    }
  `);

  return useMutation({
    mutationFn: variables => {
      return client.request(register, variables);
    },
    ...options,
  });
};

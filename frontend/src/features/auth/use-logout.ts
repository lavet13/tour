import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { LogoutMutation } from '@/gql/graphql';
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

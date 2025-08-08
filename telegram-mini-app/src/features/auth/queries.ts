import { graphql } from "@/gql";
import { isGraphQLRequestError } from "@/react-query/types/is-graphql-request-error";
import { useQuery } from "@tanstack/react-query";
import { client as queryClient } from "@/react-query";
import { client as graphqlClient } from '@//graphql-request';
import { MeQuery } from '@/gql/graphql';
import { InitialDataOptions } from "@/react-query/types/initial-data-options";

export const useGetMe = (options?: InitialDataOptions<MeQuery>) => {
  const me = graphql(`
    query Me {
      me {
        id
        email
        name
        roles
        telegram {
          telegramId
          firstName
          lastName
          username
          photoUrl
          authDate
        }
      }
    }
  `);

  return useQuery({
    queryKey: [(me.definitions[0] as any).name.value],
    queryFn: async () => {
      try {
        return await graphqlClient.request(me);
      } catch (error) {
        import.meta.env.DEV && console.error("HELP?", error);
        if (isGraphQLRequestError(error)) {
          const errorCode = error.response.errors[0].extensions.code;
          console.log({ errorCode });

          if (errorCode === "AUTHENTICATION_REQUIRED") {
            queryClient.setQueryData(["Me"], null);
            import.meta.env.DEV && console.warn("Session timeout!");
          }

          if (errorCode === "UNAUTHENTICATED") {
            queryClient.setQueryData(["Me"], null);
            import.meta.env.DEV && console.warn("Unauthenticated!");
          }
        }

        throw error;
      }
    },
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
    meta: {
      toastEnabled: false,
    },
    ...options,
  });
};

export default useGetMe;

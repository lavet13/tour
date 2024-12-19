import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { graphql } from '@/gql';
import { MeQuery } from '@/gql/graphql';
import { client } from '@/graphql/graphql-request';
import { client as queryClient } from '@/react-query';
import { InitialDataOptions } from '@/react-query/types/initial-data-options';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';

export const useGetMe = (options?: InitialDataOptions<MeQuery>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const me = graphql(`
    query Me {
      me {
        id
        email
        name
        roles
      }
    }
  `);

  return useQuery<MeQuery>({
    queryKey: [(me.definitions[0] as any).name.value],
    queryFn: async () => {
      try {
        return await client.request(me);
      } catch (error) {
        import.meta.env.DEV && console.error('HELP?', error);
        if (isGraphQLRequestError(error)) {
          const errorCode = error.response.errors[0].extensions.code;

          if (errorCode === 'AUTHENTICATION_REQUIRED') {
            queryClient.setQueryData(['Me'], null);
            sessionStorage.setItem('redirectPath', location.pathname);
            import.meta.env.DEV && console.warn('Session timeout!');

            navigate('/', {
              replace: true,
              state: { from: location.pathname },
            });
            import.meta.env.DEV && console.log('navigation fired!');
          }

          if (errorCode === 'UNAUTHENTICATED') {
            queryClient.setQueryData(['Me'], null);
            isAdminRoute && sessionStorage.setItem('redirectPath', location.pathname);
            import.meta.env.DEV && console.warn('Unauthenticated!');
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

import { QueryCache, QueryClient } from '@tanstack/react-query';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { toast } from 'sonner';

export const client = new QueryClient({
  queryCache: new QueryCache({
    onError(error, query) {
      import.meta.env.DEV && console.log({ state: query.state });

      if(query.meta) {
        if(query.meta.toastEnabled === false) return;
      }

      if (isGraphQLRequestError(error)) {
        console.error({ error });
        toast.error(error.response.errors[0].message, {
          position: 'top-center',
          duration: 4000,
          richColors: true,
        });
      } else if (error instanceof Error) {
        toast.error(error.message, {
          position: 'top-center',
          duration: 4000,
          richColors: true,
        });
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

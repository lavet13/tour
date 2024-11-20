import { QueryCache, QueryClient } from '@tanstack/react-query';
import { isGraphQLRequestError } from '@/types/is-graphql-request-error';
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
          duration: 4000,
          richColors: true,
        });
      } else if (error instanceof Error) {
        toast.error(error.message, {
          duration: 4000,
          richColors: true,
        });
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10, // it was 15 min
      gcTime: 1000 * 60 * 60 * 24, // garbage collected in 24 hours
    },
  },
});

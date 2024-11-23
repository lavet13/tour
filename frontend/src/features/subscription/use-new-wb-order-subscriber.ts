import { graphql } from '@/gql';
import { CreatedBookSubscriptionDocument, CreatedBookSubscriptionSubscription } from '@/gql/graphql';
import { print } from 'graphql';
import { client } from '@/graphql/graphql-sse';
import { useEffect, useState } from 'react';

export function useNewWbOrderSubscriber() {
  const [createdBook, setCreatedBook] = useState<CreatedBookSubscriptionSubscription['newWbOrder']>();
  const [error, setError] = useState<Error | null>(null);

  graphql(`
    subscription CreatedBookSubscription {
      createdBook {
        id
      }
    }
  `);

  useEffect(() => {
    const subscriptionQuery = print(CreatedBookSubscriptionDocument);

    console.log({ subscriptionQuery });

    const unsubscribe = client.subscribe<CreatedBookSubscriptionSubscription>(
      {
        query: subscriptionQuery,
      },
      {
        next: data => {
          if(data.data) {
            setCreatedBook(data.data.createdBook);
          }
        },
        error: (err) => {
          console.error(err);
          setError(err as Error);
        },
        complete: () => {
          console.log('completed');
        },
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return { createdBook, error };
}

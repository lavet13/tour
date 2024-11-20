import { graphql } from '@/gql';
import { NewWbOrderSubscriptionDocument, NewWbOrderSubscriptionSubscription } from '@/gql/graphql';
import { print } from 'graphql';
import { client } from '@/graphql/graphql-sse';
import { useEffect, useState } from 'react';

export function useNewWbOrderSubscriber() {
  const [newOrder, setNewOrder] = useState<NewWbOrderSubscriptionSubscription['newWbOrder']>();
  const [error, setError] = useState<Error | null>(null);

  graphql(`
    subscription CreatedBookSubscription {
      createdBook {
        id
      }
    }
  `);

  useEffect(() => {
    const subscriptionQuery = print(NewWbOrderSubscriptionDocument);

    console.log({ subscriptionQuery });

    const unsubscribe = client.subscribe<NewWbOrderSubscriptionSubscription>(
      {
        query: subscriptionQuery,
      },
      {
        next: data => {
          if(data.data) {
            setNewOrder(data.data.newWbOrder);
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

  return { newOrder, error };
}

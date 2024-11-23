import { useEffect, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { print } from 'graphql';
import { graphql } from '@/gql';
import {
  CreatedBookSubscriptionSubscription,
  CreatedBookSubscriptionDocument,
} from '@/gql/graphql';

export const useNewWbOrderSubscription = () => {
  const [createdBook, setCreatedBook] = useState<CreatedBookSubscriptionSubscription['createdBook']>();
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
    const url = new URL(`${import.meta.env.VITE_GRAPHQL_URI}`, window.location.origin);
    let ctrl: AbortController | null = null;

    const startEventSource = async () => {
      ctrl = new AbortController();

      await fetchEventSource(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        openWhenHidden: true,
        credentials: 'include',
        body: JSON.stringify({
          query: subscriptionQuery,
        }),
        signal: ctrl.signal,
        onmessage(event) {
          if (event.event === 'next') {
            const data = JSON.parse(event.data) as { data: CreatedBookSubscriptionSubscription };
            if (data.data && data.data.createdBook) {
              setCreatedBook(data.data.createdBook);
            }
          }
        },
        onerror(err: any) {
          console.error({ err });
          setError(new Error('SSE connection error'));
          // The library will automatically retry on most errors
        },
        onclose() {
            console.log('Help?');
        },
      });
    };

    startEventSource();

    return () => {
      ctrl?.abort();
    };
  }, []);

  return { createdBook, error };
};


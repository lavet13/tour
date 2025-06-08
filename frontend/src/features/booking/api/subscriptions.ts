import { useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { print } from 'graphql';
import { graphql } from '@/gql';
import {
  CreatedBookingSubscriptionSubscription,
  CreatedBookingSubscriptionDocument,
} from '@/gql/graphql';
import { atom, useAtom } from 'jotai';

const createdBookingAtom = atom<
  CreatedBookingSubscriptionSubscription['createdBooking'] | null
>(null);
const createdBookingError = atom<Error | null>(null);

export const useCreatedBookingSub = () => {
  const [createdBooking, setCreatedBooking] = useAtom(createdBookingAtom);
  const [error, setError] = useAtom(createdBookingError);

  graphql(`
    subscription CreatedBookingSubscription {
      createdBooking {
        id
      }
    }
  `);

  useEffect(() => {
    const subscriptionQuery = print(CreatedBookingSubscriptionDocument);
    const url = new URL(
      `${import.meta.env.DEV ? import.meta.env.VITE_GRAPHQL_URI_DEV : import.meta.env.VITE_GRAPHQL_URI}`,
      window.location.origin,
    );
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
            const data = JSON.parse(event.data) as {
              data: CreatedBookingSubscriptionSubscription;
            };
            if (data.data && data.data.createdBooking) {
              setCreatedBooking(data.data.createdBooking);
            }
          }
        },
        onerror(err: any) {
          setError(new Error('SSE connection error:' + err));
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

  return { createdBooking, error };
};

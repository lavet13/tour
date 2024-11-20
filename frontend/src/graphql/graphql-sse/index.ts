import { createClient } from 'graphql-sse';

const url = `${import.meta.env.VITE_GRAPHQL_URI}/stream`;

export const client = createClient({
  url,
  credentials: 'include',
  on: {
    connecting: () => console.log('client connecting'),
    connected: () => console.log('client connected'),
    message: (message) => console.log('client message', message),
  }
});

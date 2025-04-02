import { config } from 'dotenv';
import express, { Application } from 'express';
import 'json-bigint-patch';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { useCookies } from '@whatwg-node/server-plugin-cookies';
import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse';
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream';

import resolvers from '@/graphql/resolvers';
import typeDefs from '@/graphql/types';

import { ContextValue, createContext } from '@/context';
import { YogaServerInstance, createYoga } from 'graphql-yoga';

const envFile = import.meta.env.PROD ? '.env.prod' : '.env.dev';
config({ path: envFile });
console.log(`Loaded environment from ${envFile}`);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

async function bootstrap() {
  const app = express();

  // console.log({ endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT });
  console.log({ importEnv: import.meta.env });
  // console.log({ processEnv: process.env });

  const yoga = createYoga({
    schema,
    context: createContext,
    graphqlEndpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT,
    graphiql: import.meta.env.DEV,
    landingPage: import.meta.env.PROD,
    cors: {
      credentials: true,
    },
    plugins: [
      useGraphQLSSE(),
      useCookies(),
      useDeferStream(),
    ],
  });

  console.log({ DATABASE_URL: process.env.DATABASE_URL });

  configure(app, yoga);

  if (import.meta.env.PROD) {
    app.listen(import.meta.env.VITE_PORT, () => {
      console.log(
        `🚀 Query endpoint ready at http://localhost:${
          import.meta.env.VITE_PORT
        }${import.meta.env.VITE_GRAPHQL_ENDPOINT}`
      );
    });
  }

  return app;
}

function configure(
  app: Application,
  yoga: YogaServerInstance<{}, ContextValue>,
) {
  app.use('/graphql', yoga);
}

const app = bootstrap();
export const viteNodeApp = app;

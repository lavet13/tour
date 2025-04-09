import express, { type Application } from 'express';
import { YogaServerInstance } from 'graphql-yoga';
import { ContextValue } from '@/context';

export default function configure(
  app: Application,
  yoga: YogaServerInstance<{}, ContextValue>,
) {
  app.use(yoga.graphqlEndpoint, yoga).use('/static', express.static('uploads'));
}

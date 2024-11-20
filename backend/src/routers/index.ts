import { Application } from 'express';
import { YogaServerInstance } from 'graphql-yoga';
import { ContextValue } from '@/context';

export default function configure(
  app: Application,
  yoga: YogaServerInstance<{}, ContextValue>,
) {
  app.use('/graphql', yoga);
}

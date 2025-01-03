import jwt from 'jsonwebtoken';
import { YogaInitialContext } from 'graphql-yoga';
import prisma from '@/prisma';
import { getTokenFromRequest } from '@/helpers/get-token-from-request';
import { pubSub } from '@/pubsub';
import { createLoaders } from './graphql/loaders';
export type ContextValue = {
  prisma: typeof prisma;
  token: string | null;
  me: jwt.JwtPayload | null;
  pubSub: typeof pubSub;
  loaders: ReturnType<typeof createLoaders>;
} & YogaInitialContext;

export async function createContext({
  request,
}: YogaInitialContext): Promise<ContextValue> {
  return {
    prisma,
    token: await getTokenFromRequest(request),
    pubSub,
    loaders: createLoaders(prisma),
  } as ContextValue;
}

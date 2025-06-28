import jwt from 'jsonwebtoken';
import { YogaInitialContext } from 'graphql-yoga';
import prisma from '@/prisma';
import { getTokenFromRequest } from '@/helpers/get-token-from-request';
import { pubSub } from '@/pubsub';
import { createLoaders } from './graphql/loaders';
import { bot, TCustomBot } from '@/services/grammy';

export type ContextValue = {
  prisma: typeof prisma;
  token: string | null;
  me: jwt.JwtPayload | null;
  pubSub: typeof pubSub;
  loaders: ReturnType<typeof createLoaders>;
  bot: TCustomBot;
} & YogaInitialContext;

export async function createContext({
  request,
}: YogaInitialContext): Promise<ContextValue> {
  return {
    prisma,
    token: await getTokenFromRequest(request),
    pubSub,
    loaders: createLoaders(prisma),
    bot,
  } as ContextValue;
}

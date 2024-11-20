import { createPubSub } from 'graphql-yoga';
import { Booking } from '@prisma/client';

export type PubSubChannels = {
  createdBook: [{ createdBook: Booking }];
};

export const pubSub = createPubSub<PubSubChannels>();

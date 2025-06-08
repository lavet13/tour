import { createPubSub } from 'graphql-yoga';
import { Booking } from '@prisma/client';

export type PubSubChannels = {
  createdBooking: [{ createdBooking: Booking }];
};

export const pubSub = createPubSub<PubSubChannels>();

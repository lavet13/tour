import { Resolvers } from '@/graphql/__generated__/types';
import { BigIntResolver, DateTimeResolver, ByteResolver } from 'graphql-scalars';

const resolvers: Resolvers = {
  DateTime: DateTimeResolver,
  BigInt: BigIntResolver,
  Byte: ByteResolver,
};

export default resolvers;

import { Resolvers } from '@/graphql/__generated__/types';
import { BigIntResolver, ByteResolver } from 'graphql-scalars';
import { DateResolver } from '@/graphql/scalars/date.scalars';

const resolvers: Resolvers = {
  Date: DateResolver,
  BigInt: BigIntResolver,
  Byte: ByteResolver,
};

export default resolvers;

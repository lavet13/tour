import { Resolvers } from '@/graphql/__generated__/types';
import { ByteResolver, CuidResolver, BigIntResolver } from 'graphql-scalars';

// Custom scalar types
import { DateResolver, TimeResolver } from '@/graphql/scalars';

const resolvers: Resolvers = {
  Date: DateResolver,
  Time: TimeResolver,
  Byte: ByteResolver,
  Cuid: CuidResolver,
  BigInt: BigIntResolver,
};

export default resolvers;

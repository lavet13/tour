import { Resolvers } from '@/graphql/__generated__/types';
import { ByteResolver, CuidResolver } from 'graphql-scalars';
import { DateResolver } from '@/graphql/scalars/date.scalars';

const resolvers: Resolvers = {
  Date: DateResolver,
  Byte: ByteResolver,
  Cuid: CuidResolver,
};

export default resolvers;

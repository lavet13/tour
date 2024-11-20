import { mergeResolvers } from '@graphql-tools/merge';
import userResolvers from '@/graphql/resolvers/user/user.resolvers';
import wbOrderResolvers from '@/graphql/resolvers/booking/booking.resolvers';
import scalarResolvers from '@/graphql/resolvers/scalar/scalar.resolvers';
import cityResolvers from '@/graphql/resolvers/city/city.resolvers';

export default mergeResolvers([userResolvers, wbOrderResolvers, scalarResolvers, cityResolvers]);

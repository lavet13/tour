import { mergeTypeDefs } from '@graphql-tools/merge';
import userTypes from '@/graphql/types/user/user.types';
import wbOrderTypes from '@/graphql/types/booking/booking.types';
import scalarTypes from '@/graphql/types/scalar/scalar.types';
import cityTypes from '@/graphql/types/city/city.types';
import routeTypes from '@/graphql/types/route/route.types';

export default mergeTypeDefs([
  scalarTypes,
  userTypes,
  wbOrderTypes,
  cityTypes,
  routeTypes,
]);

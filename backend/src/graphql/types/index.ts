import { mergeTypeDefs } from '@graphql-tools/merge';
import userTypes from '@/graphql/types/user/user.types';
import wbOrderTypes from '@/graphql/types/booking/booking.types';
import scalarTypes from '@/graphql/types/scalar/scalar.types';
import cityTypes from '@/graphql/types/city/city.types';
import routeTypes from '@/graphql/types/route/route.types';
import regionTypes from '@/graphql/types/region/region.types';
import scheduleTypes from '@/graphql/types/schedule/schedule.types';
import feedbackTypes from '@/graphql/types/feedback/feedback.types';

export default mergeTypeDefs([
  scalarTypes,
  scheduleTypes,
  userTypes,
  wbOrderTypes,
  cityTypes,
  routeTypes,
  regionTypes,
  feedbackTypes,
]);

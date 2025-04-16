import { InfiniteRoutesQuery } from "@/gql/graphql";

export type Route = Omit<
  InfiniteRoutesQuery['infiniteRoutes']['edges'][number],
  '__typename'
>;

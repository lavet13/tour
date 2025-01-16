import gql from "graphql-tag";

export default gql`
  type Query {
    routes(input: RoutesInput!): RoutesResponse!
    routeById(id: ID): Route
    routesByRegion(regionId: ID!): [City!]!
  }

  type Mutation {
    createRoute(input: CreateRouteInput!): Route!
  }

  type Subscription {
    createdRoute: Route!
  }

  input SortingState {
    id: String!
    desc: Boolean!
  }

  input RoutesInput {
    take: Int
    after: ID
    before: ID

    query: String!
    sorting: [SortingState!]!
  }

  enum SearchTypeRoutes {
    ID
    PHONE
    FIRST_NAME
    LAST_NAME
  }

  type PageInfo {
    startCursor: ID
    endCursor: ID
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type RoutesResponse {
    edges: [Route!]!
    pageInfo: PageInfo!
  }

  input CreateRouteInput {
    departureCityId: ID!
    arrivalCityId: ID!
    regionId: ID
    isActive: Boolean!
    departureDate: Date
  }

  type Route {
    id: ID!
    departureCity: City
    arrivalCity: City
    region: Region
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
    departureDate: Date
    bookings: [Booking!]!
    schedules: [Schedule!]!
  }
`;

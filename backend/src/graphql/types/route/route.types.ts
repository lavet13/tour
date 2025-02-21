import gql from 'graphql-tag';

export default gql`
  type Query {
    routes(input: RoutesInput!): RoutesResponse!
    routeById(id: ID): Route
    routesByRegion(regionId: ID!): [City!]!
  }

  type Mutation {
    createRoute(input: CreateRouteInput!): Route!
    updateRoute(id: ID!, input: CreateRouteInput!): Route!
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
    price: Int!
  }

  type Route {
    id: ID!
    departureCity: City
    arrivalCity: City
    region: Region
    isActive: Boolean!
    price: Int!
    createdAt: Date!
    updatedAt: Date!
    departureDate: Date
    bookings: [Booking!]!
    schedules: [Schedule!]!
  }
`;

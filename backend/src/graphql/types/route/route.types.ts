import gql from 'graphql-tag';

export default gql`
  type Query {
    routes(input: RoutesInput!): RoutesResponse!
    routeById(id: ID!): Route
    routesByRegion(regionId: ID!): [City!]!
  }

  type Mutation {
    createSchedule(input: ScheduleInput!): Schedule!
    createRoute(input: RouteInput!): Route!
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

  input RouteInput {
    departureCityId: ID!
    arrivalCityId: ID!
    price: Int!
  }

  input ScheduleInput {
    routeId: ID!
    daysOfWeek: ID!
    startTime: Date!
    endTime: Date!
    seatsAvailable: Int!
  }

  type Route {
    id: ID!
    departureCity: City
    arrivalCity: City
    region: Region
    price: Int!
    createdAt: Date!
    updatedAt: Date!
    departureDate: Date
    bookings: [Booking!]!
    schedules: [Schedule!]!
  }

  type Schedule {
    route: Route
    daysOfWeek: [DaysOfWeek!]!
    startTime: Date!
    endTime: Date
    seatsAvailable: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  enum DaysOfWeek {
    MONDAY
    TUESDAY
    WEDNESDAY
    THURSDAY
    FRIDAY
    SATURDAY
    SUNDAY
  }
`;

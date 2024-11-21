import gql from 'graphql-tag';

export default gql`
  type Query {
    routes(input: RoutesInput!): RoutesResponse!
    routeById(id: BigInt!): Route
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
    after: BigInt
    before: BigInt

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
    startCursor: BigInt
    endCursor: BigInt
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type RoutesResponse {
    edges: [Route!]!
    pageInfo: PageInfo!
  }

  input RouteInput {
    departureCityId: BigInt!
    arrivalCityId: BigInt!
    price: Int!
  }

  input ScheduleInput {
    routeId: BigInt!
    daysOfWeek: BigInt!
    startTime: DateTime!
    endTime: DateTime!
    seatsAvailable: Int!
  }

  type Route {
    id: BigInt!
    departureCity: City
    arrivalCity: City
    price: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    bookings: [Booking!]!
    schedules: [Schedule!]!
  }

  type Schedule {
    route: Route!
    daysOfWeek: [DaysOfWeek!]!
    startTime: DateTime!
    endTime: DateTime
    seatsAvailable: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
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

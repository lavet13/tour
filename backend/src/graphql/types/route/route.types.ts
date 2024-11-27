import gql from 'graphql-tag';

export default gql`
  type Query {
    routes(input: RoutesInput!): RoutesResponse!
    routeById(id: BigInt!): Route
    routesByRegion(regionId: BigInt!): [City!]!
    regionByName(regionName: String!): Region
    regionForRoute(departureCityId: BigInt!, arrivalCityId: BigInt!): Region
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
    startTime: Date!
    endTime: Date!
    seatsAvailable: Int!
  }

  type Region {
    id: BigInt!
    name: String!
    routes: [Route!]!
    createdAt: Date!
    updatedAt: Date!
  }

  type Route {
    id: BigInt!
    departureCity: City
    arrivalCity: City
    region: Region
    price: Int!
    createdAt: Date!
    updatedAt: Date!
    departureDate: Date
    isAvailable: Boolean
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

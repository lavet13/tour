import gql from "graphql-tag";

export default gql`
  type Query {
    routes(input: RoutesInput!): RoutesResponse!
    routeById(id: ID!): Route
    routesByRegion(regionId: ID!): [City!]!
  }

  type Mutation {
    createSchedule(input: ScheduleInput!): Schedule!
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
  }

  input ScheduleInput {
    routeId: ID!
    dayOfWeek: DaysOfWeek!
    travelDate: Date!
    startTime: Date!
    endTime: Date!
    seatsAvailable: Int!
    seatsBooked: Int!
    isActive: Boolean!
    price: Int!
  }

  type Route {
    id: ID!
    departureCity: City
    arrivalCity: City
    region: Region
    createdAt: Date!
    updatedAt: Date!
    departureDate: Date
    bookings: [Booking!]!
    schedules: [Schedule!]!
  }

  type Schedule {
    route: Route
    dayOfWeek: DaysOfWeek!
    travelDate: Date!
    startTime: Date!
    endTime: Date!
    seatsAvailable: Int!
    seatsBooked: Int!
    isActive: Boolean!
    price: Int!
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

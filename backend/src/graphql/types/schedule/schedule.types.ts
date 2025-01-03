import gql from "graphql-tag";

export default gql`
  type Query {
    schedulesByRoute(routeId: ID!): [Schedule!]!
  }

  type Mutation {
    createSchedule(input: ScheduleInput!): Schedule!
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

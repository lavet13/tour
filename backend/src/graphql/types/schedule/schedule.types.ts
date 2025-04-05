import gql from 'graphql-tag';

export default gql`
  type Query {
    schedulesByRoute(routeId: ID): [Schedule!]!
    scheduleById(scheduleId: ID): Schedule
    schedulesByIds(departureCityId: ID, arrivalCityId: ID): [Schedule!]!
  }

  type Mutation {
    createSchedule(input: CreateScheduleInput!): Schedule!
    updateSchedule(input: UpdateScheduleInput!): Schedule!
    deleteSchedule(id: ID!): Schedule!
  }

  input UpdateScheduleInput {
    id: ID!
    direction: RouteDirection
    stopName: String
    departureTime: Time
    arrivalTime: Time
    isActive: Boolean
  }

  input CreateScheduleInput {
    routeId: ID!
    direction: RouteDirection!
    stopName: String
    departureTime: Time
    arrivalTime: Time
    isActive: Boolean!
  }

  type Schedule {
    id: ID!
    route: Route
    direction: RouteDirection!
    stopName: String
    departureTime: Time
    arrivalTime: Time
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  enum RouteDirection {
    FORWARD
    BACKWARD
  }
`;

import gql from 'graphql-tag';

export default gql`
  type Query {
    schedulesByRoute(routeId: ID, direction: RouteDirection): [Schedule!]!
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
    cityId: ID
    direction: RouteDirection
    stopName: String
    time: Time
    isActive: Boolean
  }

  input CreateScheduleInput {
    routeId: ID!
    direction: RouteDirection!
    stopName: String
    time: Time
    cityId: ID
    isActive: Boolean!
  }

  type Schedule {
    id: ID!
    route: Route
    city: City
    direction: RouteDirection!
    stopName: String
    time: Time
    isActive: Boolean!
    order: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  enum RouteDirection {
    FORWARD
    BACKWARD
  }
`;

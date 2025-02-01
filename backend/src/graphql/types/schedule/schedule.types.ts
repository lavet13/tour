import gql from 'graphql-tag';

export default gql`
  type Query {
    schedulesByRoute(routeId: ID): [Schedule!]!
  }

  type Mutation {
    createSchedule(input: ScheduleInput!): Schedule!
    updateSchedule(input: UpdateScheduleInput!): Schedule!
  }

  input UpdateScheduleInput {
    id: ID!
    routeId: ID!
    isActive: Boolean!
  }

  input ScheduleInput {
    routeId: ID!
    dayOfWeek: DaysOfWeek!
    startTime: Date!
    endTime: Date!
    isActive: Boolean!
  }

  type Schedule {
    id: ID!
    route: Route
    dayOfWeek: DaysOfWeek!
    startTime: Date!
    endTime: Date!
    isActive: Boolean!
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

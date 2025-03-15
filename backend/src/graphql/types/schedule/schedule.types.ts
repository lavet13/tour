import gql from 'graphql-tag';

export default gql`
  type Query {
    schedulesByRoute(routeId: ID): [Schedule!]!
    scheduleById(scheduleId: ID): Schedule
  }

  type Mutation {
    createSchedule(input: CreateScheduleInput!): Schedule!
    updateSchedule(input: UpdateScheduleInput!): Schedule!
    deleteSchedule(id: ID!): Schedule!
  }

  input UpdateScheduleInput {
    id: ID!
    dayOfWeek: DaysOfWeek
    startTime: Time
    endTime: Time
    isActive: Boolean
  }

  input CreateScheduleInput {
    routeId: ID!
    dayOfWeek: DaysOfWeek!
    startTime: Time!
    endTime: Time!
    isActive: Boolean!
  }

  type Schedule {
    id: ID!
    route: Route
    dayOfWeek: DaysOfWeek!
    startTime: Time!
    endTime: Time!
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

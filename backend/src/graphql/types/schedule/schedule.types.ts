import gql from 'graphql-tag';

export default gql`
  type Query {
    schedulesByRoute(routeId: ID): [Schedule!]!
  }

  type Mutation {
    createSchedule(input: ScheduleInput!): Schedule!
  }

  input ScheduleInput {
    routeId: ID!
    travelDate: Date!
    startTime: Date!
    endTime: Date!
    isActive: Boolean!
  }

  type Schedule {
    id: ID!
    route: Route
    days: [ScheduleDays!]!
    startTime: Date!
    endTime: Date!
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  type ScheduleDays {
    id: ID!
    schedule: Schedule
    dayOfWeek: DaysOfWeek!

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

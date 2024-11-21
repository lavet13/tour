import gql from 'graphql-tag';

export default gql`
  type Query {
    bookings(input: BookingsInput!): BookingsResponse!
    bookingById(id: BigInt!): Booking
  }

  type Mutation {
    createBooking(input: BookingInput!): Booking!
  }

  type Subscription {
    createdBook: Booking!
  }

  input SortingState {
    id: String!
    desc: Boolean!
  }

  input BookingsInput {
    take: Int
    after: BigInt
    before: BigInt
    status: BookingStatus

    query: String!
    sorting: [SortingState!]!
  }

  enum SearchTypeBookings {
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

  type BookingsResponse {
    edges: [Booking!]!
    pageInfo: PageInfo!
  }

  input BookingInput {
    firstName: String!
    lastName: String!
    phoneNumber: String!
    routeId: BigInt!
    travelDate: DateTime!
    seatsCount: Int!
  }

  type Booking {
    id: BigInt!
    firstName: String!
    lastName: String!
    phoneNumber: String!
    route: Route
    travelDate: DateTime!
    seatsCount: Int!
    status: BookingStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum BookingStatus {
    PENDING # Ожидает обработки
    CONFIRMED # Подтверждено-ожидайте звонка диспетчера
  }
`;

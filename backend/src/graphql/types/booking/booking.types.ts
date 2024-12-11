import gql from 'graphql-tag';

export default gql`
  type Query {
    bookings(input: BookingsInput!): BookingsResponse!
    bookingById(id: ID!): Booking
  }

  type Mutation {
    createBooking(input: BookingInput!): Booking!
    updateBookingStatus(input: BookingStatusInput!): Booking!
  }

  input BookingStatusInput {
    id: ID!
    status: BookingStatus!
  }

  type Subscription {
    createdBook: Booking!
  }

  input SortingState {
    id: String!
    desc: Boolean!
  }

  input ColumnFiltersState {
    id: String!
    value: [String]!
  }

  input BookingsInput {
    take: Int
    after: ID
    before: ID
    status: BookingStatus

    query: String!
    sorting: [SortingState!]!
    columnFilters: [ColumnFiltersState]!
  }

  enum SearchTypeBookings {
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

  type BookingsResponse {
    edges: [Booking!]!
    pageInfo: PageInfo!
  }

  input BookingInput {
    firstName: String!
    lastName: String!
    phoneNumber: String!
    departureCityId: ID!
    arrivalCityId: ID!
    travelDate: Date!
    seatsCount: Int!
    commentary: String
  }

  type Booking {
    id: ID!
    firstName: String!
    lastName: String!
    phoneNumber: String!
    route: Route
    travelDate: Date!
    seatsCount: Int!
    commentary: String
    status: BookingStatus!
    createdAt: Date!
    updatedAt: Date!
  }

  enum BookingStatus {
    PENDING # Ожидает обработки
    CONFIRMED # Подтверждено-ожидайте звонка диспетчера
  }
`;

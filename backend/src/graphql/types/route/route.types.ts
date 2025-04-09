import gql from 'graphql-tag';

export default gql`
  type Query {
    routes(regionId: ID!): [Route!]!
    infiniteRoutes(input: RoutesInput!): RoutesResponse!
    routeById(id: ID): Route
    routeByIds(departureCityId: ID, arrivalCityId: ID): Route
    routesGallery(limit: Int, offset: Int): GalleryResponse!
  }

  type Mutation {
    createRoute(input: CreateRouteInput!): Route!
    updateRoute(id: ID!, input: CreateRouteInput!): Route!
    uploadPhotoRoute(
      file: File!
      isPhotoSelected: Boolean
      routeId: ID!
    ): UploadPhotoRouteResponse!
  }

  type RouteByIdResponse {
    route: Route!
    photo: File
  }

  type UploadPhotoRouteResponse {
    photo: File!
    routeId: ID!
    regionId: ID
  }

  type GalleryResponse {
    totalCount: Int!
    images: [File!]!
  }

  type Subscription {
    createdRoute: Route!
  }

  input SortingState {
    id: String!
    desc: Boolean!
  }

  input RoutesInput {
    initialLoading: Boolean
    take: Int
    after: ID
    before: ID

    query: String
    sorting: [SortingState!]!
    regionIds: [ID!]!
    arrivalCityId: ID
    departureCityId: ID
    includeInactiveRegions: Boolean
    includeInactiveCities: Boolean
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
    regionId: ID
    isActive: Boolean!
    departureDate: Date
    price: Int!
  }

  type Route {
    id: ID!
    departureCity: City
    arrivalCity: City
    region: Region
    isActive: Boolean!
    photoName: String
    price: Int!
    createdAt: Date!
    updatedAt: Date!
    departureDate: Date
    bookings: [Booking!]!
    schedules: [Schedule!]!
  }
`;

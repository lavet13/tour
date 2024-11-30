import gql from 'graphql-tag';

export default gql`
  type Query {
    cities(input: CitiesInput!): CitiesResponse!
    departureCities(regionId: ID): [City!]!
    arrivalCities(departureCityId: ID): [City!]!
  }

  type Mutation {
    createCity(name: String!): City!
  }

  input CitiesInput {
    take: Int
    after: ID
    before: ID

    query: String!
  }

  enum SearchTypeCities {
    ID
    NAME
  }

  type PageInfo {
    startCursor: ID
    endCursor: ID
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type CitiesResponse {
    edges: [City!]!
    pageInfo: PageInfo!
  }

  type City {
    id: ID!
    name: String!
    departureTrips: [Route!]!
    arrivalTrips: [Route!]!
    createdAt: Date!
    updatedAt: Date!
  }
`;

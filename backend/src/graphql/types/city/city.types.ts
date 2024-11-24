import gql from 'graphql-tag';

export default gql`
  type Query {
    cities(input: CitiesInput!): CitiesResponse!
  }

  type Mutation {
    createCity(name: String!): City!
  }

  input CitiesInput {
    take: Int
    after: BigInt
    before: BigInt

    query: String!
  }

  enum SearchTypeCities {
    ID
    NAME
  }

  type PageInfo {
    startCursor: BigInt
    endCursor: BigInt
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type CitiesResponse {
    edges: [City!]!
    pageInfo: PageInfo!
  }

  type City {
    id: BigInt!
    name: String!
    departureTrips: [Route!]!
    arrivalTrips: [Route!]!
    createdAt: Date!
    updatedAt: Date!
  }
`;

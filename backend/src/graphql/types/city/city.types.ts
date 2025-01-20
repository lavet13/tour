import gql from 'graphql-tag';

export default gql`
  type Query {
    cities: [City!]!
    departureCities(regionId: ID): [City!]!
    arrivalCities(departureCityId: ID): [City!]!
  }

  type Mutation {
    createCity(name: String!): City!
  }

  type City {
    id: ID!
    name: String!
    departureTrips(regionId: ID!): [Route!]!
    arrivalTrips(regionId: ID!): [Route!]!
    createdAt: Date!
    updatedAt: Date!
  }
`;

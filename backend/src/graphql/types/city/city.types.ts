import gql from 'graphql-tag';

export default gql`
  type Query {
    cities: [City!]!
    departureCities: [City!]!
    arrivalCities(cityId: ID): [City!]!
  }

  type Mutation {
    createCity(name: String!): City!
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

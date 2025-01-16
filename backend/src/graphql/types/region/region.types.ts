import gql from "graphql-tag";

export default gql`
  type Query {
    regions: [Region!]!
    regionByName(regionName: String!): Region
    regionForRoute(departureCityId: ID, arrivalCityId: ID): Region
  }

  type Region {
    id: ID!
    name: String!
    routes: [Route!]!
    createdAt: Date!
    updatedAt: Date!
  }
`;

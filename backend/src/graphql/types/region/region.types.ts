import gql from "graphql-tag";

export default gql`
  type Query {
    regions: [Region!]!
    regionByName(regionName: String!): Region
    regionForRoute(departureCityId: ID, arrivalCityId: ID): Region
  }

  input RegionsInput {
    take: Int
    after: ID
    before: ID

    query: String!
    sorting: [SortingState!]!
  }

  enum SearchTypeRegions {
    ID
  }

  type PageInfo {
    startCursor: ID
    endCursor: ID
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type RegionsResponse {
    edges: [Region!]!
    pageInfo: PageInfo!
  }

  type Region {
    id: ID!
    name: String!
    routes: [Route!]!
    createdAt: Date!
    updatedAt: Date!
  }
`;

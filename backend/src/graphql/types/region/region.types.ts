import gql from 'graphql-tag';

export default gql`
  type Query {
    regions: [Region!]!
    regionByName(regionName: String!): Region
    regionForRoute(departureCityId: BigInt, arrivalCityId: BigInt): Region
  }

  input RegionsInput {
    take: Int
    after: BigInt
    before: BigInt

    query: String!
    sorting: [SortingState!]!
  }

  enum SearchTypeRegions {
    ID
  }

  type PageInfo {
    startCursor: BigInt
    endCursor: BigInt
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type RegionsResponse {
    edges: [Region!]!
    pageInfo: PageInfo!
  }

  type Region {
    id: BigInt!
    name: String!
    routes: [Route!]!
    createdAt: Date!
    updatedAt: Date!
  }
`;


/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  BigInt: { input: any; output: any; }
  /** The `Byte` scalar type represents byte value as a Buffer */
  Byte: { input: any; output: any; }
  /** Custom `Date` scalar type */
  Date: { input: any; output: any; }
  File: { input: any; output: any; }
};

export type BookingInput = {
  arrivalCityId: Scalars['BigInt']['input'];
  departureCityId: Scalars['BigInt']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
  routeId: Scalars['BigInt']['input'];
  seatsCount: Scalars['Int']['input'];
  travelDate: Scalars['Date']['input'];
};

export enum BookingStatus {
  Confirmed = 'CONFIRMED',
  Pending = 'PENDING'
}

export type BookingsInput = {
  after?: InputMaybe<Scalars['BigInt']['input']>;
  before?: InputMaybe<Scalars['BigInt']['input']>;
  query: Scalars['String']['input'];
  sorting: Array<SortingState>;
  status?: InputMaybe<BookingStatus>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type CitiesInput = {
  after?: InputMaybe<Scalars['BigInt']['input']>;
  before?: InputMaybe<Scalars['BigInt']['input']>;
  query: Scalars['String']['input'];
  take?: InputMaybe<Scalars['Int']['input']>;
};

export enum DaysOfWeek {
  Friday = 'FRIDAY',
  Monday = 'MONDAY',
  Saturday = 'SATURDAY',
  Sunday = 'SUNDAY',
  Thursday = 'THURSDAY',
  Tuesday = 'TUESDAY',
  Wednesday = 'WEDNESDAY'
}

export type LoginInput = {
  login: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export enum Role {
  Admin = 'ADMIN',
  Manager = 'MANAGER',
  User = 'USER'
}

export type RouteInput = {
  arrivalCityId: Scalars['BigInt']['input'];
  departureCityId: Scalars['BigInt']['input'];
  price: Scalars['Int']['input'];
};

export type RoutesInput = {
  after?: InputMaybe<Scalars['BigInt']['input']>;
  before?: InputMaybe<Scalars['BigInt']['input']>;
  query: Scalars['String']['input'];
  sorting: Array<SortingState>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type ScheduleInput = {
  daysOfWeek: Scalars['BigInt']['input'];
  endTime: Scalars['Date']['input'];
  routeId: Scalars['BigInt']['input'];
  seatsAvailable: Scalars['Int']['input'];
  startTime: Scalars['Date']['input'];
};

export enum SearchTypeBookings {
  FirstName = 'FIRST_NAME',
  Id = 'ID',
  LastName = 'LAST_NAME',
  Phone = 'PHONE'
}

export enum SearchTypeCities {
  Id = 'ID',
  Name = 'NAME'
}

export enum SearchTypeRoutes {
  FirstName = 'FIRST_NAME',
  Id = 'ID',
  LastName = 'LAST_NAME',
  Phone = 'PHONE'
}

export type SignupInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SortingState = {
  desc: Scalars['Boolean']['input'];
  id: Scalars['String']['input'];
};

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, email: string, name: string, roles: Array<Role> } | null };

export type LoginMutationVariables = Exact<{
  loginInput: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', accessToken: string, refreshToken: string } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type RefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'AuthPayload', accessToken: string, refreshToken: string } };

export type RegisterMutationVariables = Exact<{
  signupInput: SignupInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', signup: { __typename?: 'AuthPayload', accessToken: string, refreshToken: string } };

export type GetArrivalCitiesQueryVariables = Exact<{
  departureCityId: Scalars['BigInt']['input'];
}>;


export type GetArrivalCitiesQuery = { __typename?: 'Query', arrivalCities: Array<{ __typename?: 'City', id: any, name: string }> };

export type GetDepartureCitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDepartureCitiesQuery = { __typename?: 'Query', departureCities: Array<{ __typename?: 'City', id: any, name: string }> };

export type RegionByNameQueryVariables = Exact<{
  regionName: Scalars['String']['input'];
}>;


export type RegionByNameQuery = { __typename?: 'Query', regionByName?: { __typename?: 'Region', id: any, name: string } | null };

export type InfiniteRoutesQueryVariables = Exact<{
  input: RoutesInput;
}>;


export type InfiniteRoutesQuery = { __typename?: 'Query', routes: { __typename?: 'RoutesResponse', edges: Array<{ __typename?: 'Route', id: any, price: number, createdAt: any, updatedAt: any, departureCity?: { __typename?: 'City', id: any, name: string } | null, region?: { __typename?: 'Region', id: any, name: string } | null, arrivalCity?: { __typename?: 'City', id: any, name: string } | null }>, pageInfo: { __typename?: 'PageInfo', endCursor?: any | null, hasNextPage: boolean, startCursor?: any | null, hasPreviousPage: boolean } } };

export type RoutesByRegionQueryVariables = Exact<{
  regionId: Scalars['BigInt']['input'];
}>;


export type RoutesByRegionQuery = { __typename?: 'Query', routesByRegion: Array<{ __typename?: 'City', id: any, name: string, departureTrips: Array<{ __typename?: 'Route', id: any, price: number, departureDate?: any | null, isAvailable?: boolean | null, departureCity?: { __typename?: 'City', id: any } | null, arrivalCity?: { __typename?: 'City', id: any, name: string } | null }> }> };

export type RoutesQueryVariables = Exact<{
  input: RoutesInput;
}>;


export type RoutesQuery = { __typename?: 'Query', routes: { __typename?: 'RoutesResponse', edges: Array<{ __typename?: 'Route', id: any }>, pageInfo: { __typename?: 'PageInfo', endCursor?: any | null, hasNextPage: boolean, startCursor?: any | null, hasPreviousPage: boolean } } };

export type CreatedBookSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type CreatedBookSubscriptionSubscription = { __typename?: 'Subscription', createdBook: { __typename?: 'Booking', id: any } };


export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loginInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loginInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loginInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"signupInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signupInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"signupInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const GetArrivalCitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetArrivalCities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"departureCityId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BigInt"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"arrivalCities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"departureCityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"departureCityId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetArrivalCitiesQuery, GetArrivalCitiesQueryVariables>;
export const GetDepartureCitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDepartureCities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"departureCities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetDepartureCitiesQuery, GetDepartureCitiesQueryVariables>;
export const RegionByNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RegionByName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"regionName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regionByName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"regionName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"regionName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<RegionByNameQuery, RegionByNameQueryVariables>;
export const InfiniteRoutesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"InfiniteRoutes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RoutesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"departureCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"region"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arrivalCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}}]}}]}}]}}]} as unknown as DocumentNode<InfiniteRoutesQuery, InfiniteRoutesQueryVariables>;
export const RoutesByRegionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RoutesByRegion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"regionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BigInt"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routesByRegion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"regionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"regionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"departureTrips"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"departureCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arrivalCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"departureDate"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}}]}}]}}]}}]} as unknown as DocumentNode<RoutesByRegionQuery, RoutesByRegionQueryVariables>;
export const RoutesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Routes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RoutesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}}]}}]}}]}}]} as unknown as DocumentNode<RoutesQuery, RoutesQueryVariables>;
export const CreatedBookSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"CreatedBookSubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdBook"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreatedBookSubscriptionSubscription, CreatedBookSubscriptionSubscriptionVariables>;
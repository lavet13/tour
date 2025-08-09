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
  /** A field whose value conforms to the standard cuid format as specified in https://github.com/ericelliott/cuid#broken-down */
  Cuid: { input: any; output: any; }
  /** Custom `Date` scalar type supporting multiple input formats */
  Date: { input: any; output: any; }
  File: { input: any; output: any; }
  /** Time custom scalar type with format HH:mm */
  Time: { input: any; output: any; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type Booking = {
  __typename?: 'Booking';
  createdAt: Scalars['Date']['output'];
  direction: RouteDirection;
  extraPhoneNumber?: Maybe<Scalars['String']['output']>;
  extraTelegram: Scalars['Boolean']['output'];
  extraWhatsapp: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  phoneNumber: Scalars['String']['output'];
  route?: Maybe<Route>;
  seatsCount: Scalars['Int']['output'];
  status: BookingStatus;
  telegram: Scalars['Boolean']['output'];
  travelDate: Scalars['Date']['output'];
  updatedAt: Scalars['Date']['output'];
  whatsapp: Scalars['Boolean']['output'];
};

export enum BookingStatus {
  Confirmed = 'CONFIRMED',
  Pending = 'PENDING'
}

export type BookingsInput = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  columnFilters: Array<InputMaybe<ColumnFiltersState>>;
  sorting: Array<SortingState>;
  status?: InputMaybe<BookingStatus>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type BookingsResponse = {
  __typename?: 'BookingsResponse';
  edges: Array<Booking>;
  pageInfo: PageInfo;
};

export type City = {
  __typename?: 'City';
  arrivalTrips: Array<Route>;
  createdAt: Scalars['Date']['output'];
  departureTrips: Array<Route>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
};

export type ColumnFiltersState = {
  id: Scalars['String']['input'];
  value: Array<InputMaybe<Scalars['String']['input']>>;
};

export type CreateBookingInput = {
  arrivalCityId: Scalars['ID']['input'];
  departureCityId: Scalars['ID']['input'];
  direction: RouteDirection;
  extraPhoneNumber?: InputMaybe<Scalars['String']['input']>;
  extraTelegram?: InputMaybe<Scalars['Boolean']['input']>;
  extraWhatsapp?: InputMaybe<Scalars['Boolean']['input']>;
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
  seatsCount: Scalars['Int']['input'];
  telegram: Scalars['Boolean']['input'];
  telegramId?: InputMaybe<Scalars['BigInt']['input']>;
  travelDate: Scalars['Date']['input'];
  whatsapp: Scalars['Boolean']['input'];
};

export type CreateFeedbackInput = {
  message: Scalars['String']['input'];
  reason: Scalars['String']['input'];
  replyTo: Scalars['String']['input'];
};

export type CreateRouteInput = {
  arrivalCityId: Scalars['ID']['input'];
  departureCityId: Scalars['ID']['input'];
  departureDate?: InputMaybe<Scalars['Date']['input']>;
  isActive: Scalars['Boolean']['input'];
  price: Scalars['Int']['input'];
  regionId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateScheduleInput = {
  cityId?: InputMaybe<Scalars['ID']['input']>;
  direction: RouteDirection;
  isActive: Scalars['Boolean']['input'];
  routeId: Scalars['ID']['input'];
  stopName?: InputMaybe<Scalars['String']['input']>;
  time?: InputMaybe<Scalars['Time']['input']>;
};

export type Feedback = {
  __typename?: 'Feedback';
  createdAt: Scalars['Date']['output'];
  message: Scalars['String']['output'];
  reason: Scalars['String']['output'];
  replyTo: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
};

export type GalleryResponse = {
  __typename?: 'GalleryResponse';
  images: Array<Scalars['File']['output']>;
  totalCount: Scalars['Int']['output'];
};

export type LoginInput = {
  login: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  authenticateWithTelegramLogin: TelegramLoginAuthPayload;
  authenticateWithTma: TelegramLoginAuthPayload;
  createBooking: Booking;
  createCity: City;
  createFeedback: Feedback;
  createRoute: Route;
  createSchedule: Schedule;
  deleteSchedule: Schedule;
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  refreshToken: AuthPayload;
  updateBooking: Booking;
  updateRoute: Route;
  updateSchedule: Schedule;
  updateTelegramChatIds: Scalars['Boolean']['output'];
  uploadPhotoRoute: UploadPhotoRouteResponse;
};


export type MutationAuthenticateWithTelegramLoginArgs = {
  input: TelegramLoginAuthInput;
};


export type MutationAuthenticateWithTmaArgs = {
  input: TmaAuthInput;
};


export type MutationCreateBookingArgs = {
  input: CreateBookingInput;
};


export type MutationCreateCityArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateFeedbackArgs = {
  input: CreateFeedbackInput;
};


export type MutationCreateRouteArgs = {
  input: CreateRouteInput;
};


export type MutationCreateScheduleArgs = {
  input: CreateScheduleInput;
};


export type MutationDeleteScheduleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  loginInput: LoginInput;
};


export type MutationUpdateBookingArgs = {
  input: UpdateBookingInput;
};


export type MutationUpdateRouteArgs = {
  id: Scalars['ID']['input'];
  input: CreateRouteInput;
};


export type MutationUpdateScheduleArgs = {
  input: UpdateScheduleInput;
};


export type MutationUpdateTelegramChatIdsArgs = {
  input: UpdateTelegramChatIdsInput;
};


export type MutationUploadPhotoRouteArgs = {
  file: Scalars['File']['input'];
  isPhotoSelected?: InputMaybe<Scalars['Boolean']['input']>;
  routeId: Scalars['ID']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['ID']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['ID']['output']>;
};

export type Query = {
  __typename?: 'Query';
  arrivalCities: Array<City>;
  bookingById?: Maybe<Booking>;
  bookings: BookingsResponse;
  cities: Array<City>;
  departureCities: Array<City>;
  infiniteRoutes: RoutesResponse;
  me?: Maybe<User>;
  regionByName?: Maybe<Region>;
  regionForRoute?: Maybe<Region>;
  regions: Array<Region>;
  routeById?: Maybe<Route>;
  routeByIds?: Maybe<Route>;
  routes: Array<Route>;
  routesGallery: GalleryResponse;
  scheduleById?: Maybe<Schedule>;
  schedulesByIds: Array<Schedule>;
  schedulesByRoute: Array<Schedule>;
  telegramChats: Array<TelegramChat>;
};


export type QueryArrivalCitiesArgs = {
  cityId?: InputMaybe<Scalars['ID']['input']>;
  includeInactiveCities?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryBookingByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBookingsArgs = {
  input: BookingsInput;
};


export type QueryDepartureCitiesArgs = {
  includeInactiveCities?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryInfiniteRoutesArgs = {
  input: RoutesInput;
};


export type QueryRegionByNameArgs = {
  regionName: Scalars['String']['input'];
};


export type QueryRegionForRouteArgs = {
  arrivalCityId?: InputMaybe<Scalars['ID']['input']>;
  departureCityId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryRouteByIdArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryRouteByIdsArgs = {
  arrivalCityId?: InputMaybe<Scalars['ID']['input']>;
  departureCityId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryRoutesArgs = {
  regionId: Scalars['ID']['input'];
};


export type QueryRoutesGalleryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryScheduleByIdArgs = {
  scheduleId?: InputMaybe<Scalars['ID']['input']>;
};


export type QuerySchedulesByIdsArgs = {
  arrivalCityId?: InputMaybe<Scalars['ID']['input']>;
  departureCityId?: InputMaybe<Scalars['ID']['input']>;
};


export type QuerySchedulesByRouteArgs = {
  direction?: InputMaybe<RouteDirection>;
  routeId?: InputMaybe<Scalars['ID']['input']>;
};

export type Region = {
  __typename?: 'Region';
  createdAt: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  routes: Array<Route>;
  updatedAt: Scalars['Date']['output'];
};

export enum Role {
  Admin = 'ADMIN',
  Manager = 'MANAGER',
  User = 'USER'
}

export type Route = {
  __typename?: 'Route';
  arrivalCity?: Maybe<City>;
  bookings: Array<Booking>;
  createdAt: Scalars['Date']['output'];
  departureCity?: Maybe<City>;
  departureDate?: Maybe<Scalars['Date']['output']>;
  direction?: Maybe<RouteDirection>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  photoName?: Maybe<Scalars['String']['output']>;
  price: Scalars['Int']['output'];
  region?: Maybe<Region>;
  schedules: Array<Schedule>;
  updatedAt: Scalars['Date']['output'];
};

export enum RouteDirection {
  Backward = 'BACKWARD',
  Forward = 'FORWARD'
}

export type RoutesInput = {
  after?: InputMaybe<Scalars['ID']['input']>;
  arrivalCityId?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  departureCityId?: InputMaybe<Scalars['ID']['input']>;
  includeInactiveCities?: InputMaybe<Scalars['Boolean']['input']>;
  includeInactiveRegions?: InputMaybe<Scalars['Boolean']['input']>;
  initialLoading?: InputMaybe<Scalars['Boolean']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  regionIds: Array<Scalars['ID']['input']>;
  sorting: Array<SortingState>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type RoutesResponse = {
  __typename?: 'RoutesResponse';
  edges: Array<Route>;
  pageInfo: PageInfo;
};

export type Schedule = {
  __typename?: 'Schedule';
  city?: Maybe<City>;
  createdAt: Scalars['Date']['output'];
  direction: RouteDirection;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  order: Scalars['Int']['output'];
  route?: Maybe<Route>;
  stopName?: Maybe<Scalars['String']['output']>;
  time?: Maybe<Scalars['Time']['output']>;
  updatedAt: Scalars['Date']['output'];
};

export enum SearchTypeBookings {
  FirstName = 'FIRST_NAME',
  Id = 'ID',
  LastName = 'LAST_NAME',
  Phone = 'PHONE'
}

export type SortingState = {
  desc: Scalars['Boolean']['input'];
  id: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  createdBooking: Booking;
  createdRoute: Route;
};

export type TmaAuthInput = {
  initDataRaw: Scalars['String']['input'];
};

export type TelegramChat = {
  __typename?: 'TelegramChat';
  chatId: Scalars['BigInt']['output'];
  createdAt: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['Date']['output'];
  user: User;
};

export type TelegramLoginAuthInput = {
  auth_date: Scalars['Date']['input'];
  first_name: Scalars['String']['input'];
  hash: Scalars['String']['input'];
  id: Scalars['BigInt']['input'];
  last_name?: InputMaybe<Scalars['String']['input']>;
  photo_url?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type TelegramLoginAuthPayload = {
  __typename?: 'TelegramLoginAuthPayload';
  accessToken: Scalars['String']['output'];
  isNewUser: Scalars['Boolean']['output'];
  refreshToken: Scalars['String']['output'];
  user: User;
};

export type TelegramLoginUser = {
  __typename?: 'TelegramLoginUser';
  allowsWriteToPm: Scalars['Boolean']['output'];
  authDate: Scalars['Date']['output'];
  chatInstance?: Maybe<Scalars['BigInt']['output']>;
  chatType?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Date']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  languageCode?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  photoUrl?: Maybe<Scalars['String']['output']>;
  telegramId: Scalars['BigInt']['output'];
  updatedAt: Scalars['Date']['output'];
  user?: Maybe<User>;
  username?: Maybe<Scalars['String']['output']>;
};

export type UpdateBookingInput = {
  extraPhoneNumber?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  lastName?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  seatsCount?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<BookingStatus>;
  telegram?: InputMaybe<Scalars['Boolean']['input']>;
  travelDate?: InputMaybe<Scalars['Date']['input']>;
  whatsapp?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateScheduleInput = {
  cityId?: InputMaybe<Scalars['ID']['input']>;
  direction?: InputMaybe<RouteDirection>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  stopName?: InputMaybe<Scalars['String']['input']>;
  time?: InputMaybe<Scalars['Time']['input']>;
};

export type UpdateTelegramChatIdsInput = {
  telegramChatIds: Array<Scalars['BigInt']['input']>;
};

export type UploadPhotoRouteResponse = {
  __typename?: 'UploadPhotoRouteResponse';
  photo: Scalars['File']['output'];
  regionId?: Maybe<Scalars['ID']['output']>;
  routeId: Scalars['ID']['output'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  roles: Array<Role>;
  telegram?: Maybe<TelegramLoginUser>;
};

export type AuthenticateWithTmaMutationVariables = Exact<{
  input: TmaAuthInput;
}>;


export type AuthenticateWithTmaMutation = { __typename?: 'Mutation', authenticateWithTma: { __typename?: 'TelegramLoginAuthPayload', isNewUser: boolean, accessToken: string, refreshToken: string } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, email: string, name: string, roles: Array<Role>, telegram?: { __typename?: 'TelegramLoginUser', telegramId: any, firstName: string, lastName?: string | null, username?: string | null, photoUrl?: string | null, authDate: any } | null } | null };

export type CreateBookingMutationVariables = Exact<{
  input: CreateBookingInput;
}>;


export type CreateBookingMutation = { __typename?: 'Mutation', createBooking: { __typename?: 'Booking', id: string, firstName: string, lastName: string, phoneNumber: string, telegram: boolean, whatsapp: boolean, extraPhoneNumber?: string | null, extraTelegram: boolean, extraWhatsapp: boolean, travelDate: any, seatsCount: number, status: BookingStatus, createdAt: any, updatedAt: any, direction: RouteDirection, route?: { __typename?: 'Route', price: number, departureCity?: { __typename?: 'City', name: string } | null, arrivalCity?: { __typename?: 'City', name: string } | null } | null } };

export type GetArrivalCitiesQueryVariables = Exact<{
  cityId?: InputMaybe<Scalars['ID']['input']>;
  includeInactiveCities?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetArrivalCitiesQuery = { __typename?: 'Query', arrivalCities: Array<{ __typename?: 'City', id: string, name: string }> };

export type GetCitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCitiesQuery = { __typename?: 'Query', cities: Array<{ __typename?: 'City', id: string, name: string }> };

export type GetDepartureCitiesQueryVariables = Exact<{
  includeInactiveCities?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetDepartureCitiesQuery = { __typename?: 'Query', departureCities: Array<{ __typename?: 'City', id: string, name: string }> };

export type GetRouteByIdsQueryVariables = Exact<{
  departureCityId?: InputMaybe<Scalars['ID']['input']>;
  arrivalCityId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetRouteByIdsQuery = { __typename?: 'Query', routeByIds?: { __typename?: 'Route', id: string, isActive: boolean, departureDate?: any | null, price: number, photoName?: string | null, direction?: RouteDirection | null, departureCity?: { __typename?: 'City', id: string, name: string, description?: string | null } | null, arrivalCity?: { __typename?: 'City', id: string, name: string, description?: string | null } | null, region?: { __typename?: 'Region', id: string, name: string } | null } | null };

export type CreateFeedbackMutationVariables = Exact<{
  input: CreateFeedbackInput;
}>;


export type CreateFeedbackMutation = { __typename?: 'Mutation', createFeedback: { __typename?: 'Feedback', reason: string, replyTo: string, message: string } };

export type RefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'AuthPayload', accessToken: string, refreshToken: string } };


export const AuthenticateWithTmaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthenticateWithTma"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TMAAuthInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticateWithTma"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isNewUser"}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<AuthenticateWithTmaMutation, AuthenticateWithTmaMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"telegram"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"telegramId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"authDate"}}]}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const CreateBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateBookingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"telegram"}},{"kind":"Field","name":{"kind":"Name","value":"whatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"extraPhoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"extraTelegram"}},{"kind":"Field","name":{"kind":"Name","value":"extraWhatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"travelDate"}},{"kind":"Field","name":{"kind":"Name","value":"seatsCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"route"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"departureCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arrivalCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateBookingMutation, CreateBookingMutationVariables>;
export const GetArrivalCitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetArrivalCities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cityId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeInactiveCities"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"arrivalCities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cityId"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeInactiveCities"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeInactiveCities"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetArrivalCitiesQuery, GetArrivalCitiesQueryVariables>;
export const GetCitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetCitiesQuery, GetCitiesQueryVariables>;
export const GetDepartureCitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDepartureCities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeInactiveCities"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"departureCities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"includeInactiveCities"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeInactiveCities"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetDepartureCitiesQuery, GetDepartureCitiesQueryVariables>;
export const GetRouteByIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRouteByIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"departureCityId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"arrivalCityId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routeByIds"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"departureCityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"departureCityId"}}},{"kind":"Argument","name":{"kind":"Name","value":"arrivalCityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"arrivalCityId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"departureCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arrivalCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"region"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"departureDate"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"photoName"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}}]}}]}}]} as unknown as DocumentNode<GetRouteByIdsQuery, GetRouteByIdsQueryVariables>;
export const CreateFeedbackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFeedback"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFeedbackInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFeedback"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"replyTo"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<CreateFeedbackMutation, CreateFeedbackMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
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
  authenticateWithTelegram: TelegramAuthPayload;
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


export type MutationAuthenticateWithTelegramArgs = {
  input: TelegramAuthInput;
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

export type TelegramAuthInput = {
  auth_date: Scalars['Date']['input'];
  first_name: Scalars['String']['input'];
  hash: Scalars['String']['input'];
  id: Scalars['BigInt']['input'];
  last_name?: InputMaybe<Scalars['String']['input']>;
  photo_url?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type TelegramAuthPayload = {
  __typename?: 'TelegramAuthPayload';
  accessToken: Scalars['String']['output'];
  isNewUser: Scalars['Boolean']['output'];
  refreshToken: Scalars['String']['output'];
  user: User;
};

export type TelegramChat = {
  __typename?: 'TelegramChat';
  chatId: Scalars['BigInt']['output'];
  createdAt: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['Date']['output'];
  user: User;
};

export type TelegramUser = {
  __typename?: 'TelegramUser';
  authDate: Scalars['Date']['output'];
  createdAt: Scalars['Date']['output'];
  firstName: Scalars['String']['output'];
  hash: Scalars['String']['output'];
  id: Scalars['ID']['output'];
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
  telegram?: Maybe<TelegramUser>;
};

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type RefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'AuthPayload', accessToken: string, refreshToken: string } };

export type LoginMutationVariables = Exact<{
  loginInput: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', accessToken: string, refreshToken: string } };

export type AuthenticateWithTelegramMutationVariables = Exact<{
  input: TelegramAuthInput;
}>;


export type AuthenticateWithTelegramMutation = { __typename?: 'Mutation', authenticateWithTelegram: { __typename?: 'TelegramAuthPayload', isNewUser: boolean, accessToken: string, refreshToken: string } };

export type UpdateTelegramChatIdsMutationVariables = Exact<{
  input: UpdateTelegramChatIdsInput;
}>;


export type UpdateTelegramChatIdsMutation = { __typename?: 'Mutation', updateTelegramChatIds: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, email: string, name: string, roles: Array<Role>, telegram?: { __typename?: 'TelegramUser', telegramId: any, firstName: string, lastName?: string | null, username?: string | null, photoUrl?: string | null, authDate: any, hash: string } | null } | null };

export type TelegramChatIdsQueryVariables = Exact<{ [key: string]: never; }>;


export type TelegramChatIdsQuery = { __typename?: 'Query', telegramChats: Array<{ __typename?: 'TelegramChat', chatId: any }> };

export type UpdateBookingMutationVariables = Exact<{
  input: UpdateBookingInput;
}>;


export type UpdateBookingMutation = { __typename?: 'Mutation', updateBooking: { __typename?: 'Booking', id: string, firstName: string, lastName: string, phoneNumber: string, travelDate: any, seatsCount: number, status: BookingStatus, createdAt: any, updatedAt: any } };

export type CreateBookingMutationVariables = Exact<{
  input: CreateBookingInput;
}>;


export type CreateBookingMutation = { __typename?: 'Mutation', createBooking: { __typename?: 'Booking', id: string, firstName: string, lastName: string, phoneNumber: string, telegram: boolean, whatsapp: boolean, extraPhoneNumber?: string | null, extraTelegram: boolean, extraWhatsapp: boolean, travelDate: any, seatsCount: number, status: BookingStatus, createdAt: any, updatedAt: any, direction: RouteDirection, route?: { __typename?: 'Route', price: number, departureCity?: { __typename?: 'City', name: string } | null, arrivalCity?: { __typename?: 'City', name: string } | null } | null } };

export type InfiniteBookingsQueryVariables = Exact<{
  input: BookingsInput;
}>;


export type InfiniteBookingsQuery = { __typename?: 'Query', bookings: { __typename?: 'BookingsResponse', edges: Array<{ __typename?: 'Booking', id: string, firstName: string, lastName: string, phoneNumber: string, telegram: boolean, whatsapp: boolean, extraPhoneNumber?: string | null, extraTelegram: boolean, extraWhatsapp: boolean, direction: RouteDirection, travelDate: any, seatsCount: number, status: BookingStatus, createdAt: any, updatedAt: any, route?: { __typename?: 'Route', id: string, arrivalCity?: { __typename?: 'City', name: string } | null, departureCity?: { __typename?: 'City', name: string } | null } | null }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, startCursor?: string | null, hasPreviousPage: boolean } } };

export type CreatedBookingSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type CreatedBookingSubscriptionSubscription = { __typename?: 'Subscription', createdBooking: { __typename?: 'Booking', id: string } };

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

export type CreateFeedbackMutationVariables = Exact<{
  input: CreateFeedbackInput;
}>;


export type CreateFeedbackMutation = { __typename?: 'Mutation', createFeedback: { __typename?: 'Feedback', reason: string, replyTo: string, message: string } };

export type RegionByNameQueryVariables = Exact<{
  regionName: Scalars['String']['input'];
}>;


export type RegionByNameQuery = { __typename?: 'Query', regionByName?: { __typename?: 'Region', id: string, name: string } | null };

export type GetRegionForRouteQueryVariables = Exact<{
  departureCityId?: InputMaybe<Scalars['ID']['input']>;
  arrivalCityId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetRegionForRouteQuery = { __typename?: 'Query', regionForRoute?: { __typename?: 'Region', id: string, name: string } | null };

export type RegionsQueryVariables = Exact<{ [key: string]: never; }>;


export type RegionsQuery = { __typename?: 'Query', regions: Array<{ __typename?: 'Region', id: string, name: string }> };

export type UpdateRouteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CreateRouteInput;
}>;


export type UpdateRouteMutation = { __typename?: 'Mutation', updateRoute: { __typename?: 'Route', id: string, region?: { __typename?: 'Region', id: string } | null } };

export type CreateRouteMutationVariables = Exact<{
  input: CreateRouteInput;
}>;


export type CreateRouteMutation = { __typename?: 'Mutation', createRoute: { __typename?: 'Route', id: string, region?: { __typename?: 'Region', id: string } | null } };

export type UploadPhotoRouteMutationVariables = Exact<{
  file: Scalars['File']['input'];
  isPhotoSelected?: InputMaybe<Scalars['Boolean']['input']>;
  routeId: Scalars['ID']['input'];
}>;


export type UploadPhotoRouteMutation = { __typename?: 'Mutation', uploadPhotoRoute: { __typename?: 'UploadPhotoRouteResponse', photo: any, routeId: string, regionId?: string | null } };

export type GetRouteByIdsQueryVariables = Exact<{
  departureCityId?: InputMaybe<Scalars['ID']['input']>;
  arrivalCityId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetRouteByIdsQuery = { __typename?: 'Query', routeByIds?: { __typename?: 'Route', id: string, isActive: boolean, departureDate?: any | null, price: number, photoName?: string | null, direction?: RouteDirection | null, departureCity?: { __typename?: 'City', id: string, name: string, description?: string | null } | null, arrivalCity?: { __typename?: 'City', id: string, name: string, description?: string | null } | null, region?: { __typename?: 'Region', id: string, name: string } | null } | null };

export type GetRouteByIdQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetRouteByIdQuery = { __typename?: 'Query', routeById?: { __typename?: 'Route', id: string, isActive: boolean, departureDate?: any | null, price: number, photoName?: string | null, departureCity?: { __typename?: 'City', id: string, name: string } | null, arrivalCity?: { __typename?: 'City', id: string, name: string } | null, region?: { __typename?: 'Region', id: string, name: string } | null } | null };

export type InfiniteRoutesQueryVariables = Exact<{
  input: RoutesInput;
}>;


export type InfiniteRoutesQuery = { __typename?: 'Query', infiniteRoutes: { __typename?: 'RoutesResponse', edges: Array<{ __typename?: 'Route', id: string, price: number, photoName?: string | null, isActive: boolean, departureDate?: any | null, createdAt: any, updatedAt: any, departureCity?: { __typename?: 'City', id: string, name: string } | null, region?: { __typename?: 'Region', id: string, name: string } | null, arrivalCity?: { __typename?: 'City', id: string, name: string } | null }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, startCursor?: string | null, hasPreviousPage: boolean } } };

export type GetRoutesQueryVariables = Exact<{
  regionId: Scalars['ID']['input'];
}>;


export type GetRoutesQuery = { __typename?: 'Query', routes: Array<{ __typename?: 'Route', id: string, departureDate?: any | null, departureCity?: { __typename?: 'City', id: string, name: string } | null, arrivalCity?: { __typename?: 'City', id: string, name: string } | null }> };

export type GetRoutesGalleryQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetRoutesGalleryQuery = { __typename?: 'Query', routesGallery: { __typename?: 'GalleryResponse', totalCount: number, images: Array<any> } };

export type UpdateScheduleMutationVariables = Exact<{
  input: UpdateScheduleInput;
}>;


export type UpdateScheduleMutation = { __typename?: 'Mutation', updateSchedule: { __typename?: 'Schedule', id: string, isActive: boolean, direction: RouteDirection, stopName?: string | null, time?: any | null, createdAt: any, updatedAt: any, route?: { __typename?: 'Route', id: string } | null } };

export type CreateScheduleMutationVariables = Exact<{
  input: CreateScheduleInput;
}>;


export type CreateScheduleMutation = { __typename?: 'Mutation', createSchedule: { __typename?: 'Schedule', id: string, isActive: boolean, direction: RouteDirection, stopName?: string | null, time?: any | null, createdAt: any, updatedAt: any, route?: { __typename?: 'Route', id: string } | null } };

export type DeleteScheduleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteScheduleMutation = { __typename?: 'Mutation', deleteSchedule: { __typename?: 'Schedule', route?: { __typename?: 'Route', id: string } | null } };

export type GetSchedulesByRouteQueryVariables = Exact<{
  routeId?: InputMaybe<Scalars['ID']['input']>;
  direction?: InputMaybe<RouteDirection>;
}>;


export type GetSchedulesByRouteQuery = { __typename?: 'Query', schedulesByRoute: Array<{ __typename?: 'Schedule', id: string, direction: RouteDirection, stopName?: string | null, time?: any | null, isActive: boolean, createdAt: any, updatedAt: any, city?: { __typename?: 'City', id: string, name: string } | null }> };

export type GetScheduleByIdQueryVariables = Exact<{
  scheduleId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetScheduleByIdQuery = { __typename?: 'Query', scheduleById?: { __typename?: 'Schedule', id: string, direction: RouteDirection, stopName?: string | null, time?: any | null, isActive: boolean } | null };

export type GetSchedulesByIdsQueryVariables = Exact<{
  departureCityId?: InputMaybe<Scalars['ID']['input']>;
  arrivalCityId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetSchedulesByIdsQuery = { __typename?: 'Query', schedulesByIds: Array<{ __typename?: 'Schedule', direction: RouteDirection, stopName?: string | null, time?: any | null, isActive: boolean, city?: { __typename?: 'City', name: string } | null }> };


export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loginInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loginInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loginInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const AuthenticateWithTelegramDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthenticateWithTelegram"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TelegramAuthInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticateWithTelegram"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isNewUser"}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<AuthenticateWithTelegramMutation, AuthenticateWithTelegramMutationVariables>;
export const UpdateTelegramChatIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTelegramChatIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTelegramChatIdsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTelegramChatIds"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpdateTelegramChatIdsMutation, UpdateTelegramChatIdsMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"telegram"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"telegramId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"authDate"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}}]}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const TelegramChatIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TelegramChatIds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"telegramChats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chatId"}}]}}]}}]} as unknown as DocumentNode<TelegramChatIdsQuery, TelegramChatIdsQueryVariables>;
export const UpdateBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateBookingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"travelDate"}},{"kind":"Field","name":{"kind":"Name","value":"seatsCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateBookingMutation, UpdateBookingMutationVariables>;
export const CreateBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateBookingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"telegram"}},{"kind":"Field","name":{"kind":"Name","value":"whatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"extraPhoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"extraTelegram"}},{"kind":"Field","name":{"kind":"Name","value":"extraWhatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"travelDate"}},{"kind":"Field","name":{"kind":"Name","value":"seatsCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"route"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"departureCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arrivalCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateBookingMutation, CreateBookingMutationVariables>;
export const InfiniteBookingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"InfiniteBookings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BookingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bookings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"telegram"}},{"kind":"Field","name":{"kind":"Name","value":"whatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"extraPhoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"extraTelegram"}},{"kind":"Field","name":{"kind":"Name","value":"extraWhatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"travelDate"}},{"kind":"Field","name":{"kind":"Name","value":"seatsCount"}},{"kind":"Field","name":{"kind":"Name","value":"route"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"arrivalCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"departureCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}}]}}]}}]}}]} as unknown as DocumentNode<InfiniteBookingsQuery, InfiniteBookingsQueryVariables>;
export const CreatedBookingSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"CreatedBookingSubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdBooking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreatedBookingSubscriptionSubscription, CreatedBookingSubscriptionSubscriptionVariables>;
export const GetArrivalCitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetArrivalCities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cityId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeInactiveCities"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"arrivalCities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cityId"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeInactiveCities"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeInactiveCities"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetArrivalCitiesQuery, GetArrivalCitiesQueryVariables>;
export const GetCitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetCitiesQuery, GetCitiesQueryVariables>;
export const GetDepartureCitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDepartureCities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeInactiveCities"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"departureCities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"includeInactiveCities"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeInactiveCities"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetDepartureCitiesQuery, GetDepartureCitiesQueryVariables>;
export const CreateFeedbackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFeedback"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFeedbackInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFeedback"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"replyTo"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<CreateFeedbackMutation, CreateFeedbackMutationVariables>;
export const RegionByNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RegionByName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"regionName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regionByName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"regionName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"regionName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<RegionByNameQuery, RegionByNameQueryVariables>;
export const GetRegionForRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRegionForRoute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"departureCityId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"arrivalCityId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regionForRoute"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"departureCityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"departureCityId"}}},{"kind":"Argument","name":{"kind":"Name","value":"arrivalCityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"arrivalCityId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetRegionForRouteQuery, GetRegionForRouteQueryVariables>;
export const RegionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Regions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<RegionsQuery, RegionsQueryVariables>;
export const UpdateRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRoute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRouteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRoute"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"region"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateRouteMutation, UpdateRouteMutationVariables>;
export const CreateRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRoute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRouteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRoute"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"region"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateRouteMutation, CreateRouteMutationVariables>;
export const UploadPhotoRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadPhotoRoute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"file"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"File"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isPhotoSelected"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"routeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uploadPhotoRoute"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"file"},"value":{"kind":"Variable","name":{"kind":"Name","value":"file"}}},{"kind":"Argument","name":{"kind":"Name","value":"isPhotoSelected"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isPhotoSelected"}}},{"kind":"Argument","name":{"kind":"Name","value":"routeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"routeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"photo"}},{"kind":"Field","name":{"kind":"Name","value":"routeId"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}}]}}]}}]} as unknown as DocumentNode<UploadPhotoRouteMutation, UploadPhotoRouteMutationVariables>;
export const GetRouteByIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRouteByIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"departureCityId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"arrivalCityId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routeByIds"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"departureCityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"departureCityId"}}},{"kind":"Argument","name":{"kind":"Name","value":"arrivalCityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"arrivalCityId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"departureCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arrivalCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"region"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"departureDate"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"photoName"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}}]}}]}}]} as unknown as DocumentNode<GetRouteByIdsQuery, GetRouteByIdsQueryVariables>;
export const GetRouteByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRouteById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routeById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"departureCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arrivalCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"region"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"departureDate"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"photoName"}}]}}]}}]} as unknown as DocumentNode<GetRouteByIdQuery, GetRouteByIdQueryVariables>;
export const InfiniteRoutesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"InfiniteRoutes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RoutesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"infiniteRoutes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"departureCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"region"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"photoName"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"departureDate"}},{"kind":"Field","name":{"kind":"Name","value":"arrivalCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}}]}}]}}]}}]} as unknown as DocumentNode<InfiniteRoutesQuery, InfiniteRoutesQueryVariables>;
export const GetRoutesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRoutes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"regionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"regionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"regionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"departureCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arrivalCity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"departureDate"}}]}}]}}]} as unknown as DocumentNode<GetRoutesQuery, GetRoutesQueryVariables>;
export const GetRoutesGalleryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRoutesGallery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routesGallery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"images"}}]}}]}}]} as unknown as DocumentNode<GetRoutesGalleryQuery, GetRoutesGalleryQueryVariables>;
export const UpdateScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateScheduleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"route"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateScheduleMutation, UpdateScheduleMutationVariables>;
export const CreateScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateScheduleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"route"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateScheduleMutation, CreateScheduleMutationVariables>;
export const DeleteScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"route"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteScheduleMutation, DeleteScheduleMutationVariables>;
export const GetSchedulesByRouteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSchedulesByRoute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"routeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"direction"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"RouteDirection"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schedulesByRoute"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"routeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"routeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"direction"},"value":{"kind":"Variable","name":{"kind":"Name","value":"direction"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"city"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetSchedulesByRouteQuery, GetSchedulesByRouteQueryVariables>;
export const GetScheduleByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetScheduleById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scheduleId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scheduleById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scheduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scheduleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<GetScheduleByIdQuery, GetScheduleByIdQueryVariables>;
export const GetSchedulesByIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSchedulesByIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"departureCityId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"arrivalCityId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schedulesByIds"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"departureCityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"departureCityId"}}},{"kind":"Argument","name":{"kind":"Name","value":"arrivalCityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"arrivalCityId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<GetSchedulesByIdsQuery, GetSchedulesByIdsQueryVariables>;
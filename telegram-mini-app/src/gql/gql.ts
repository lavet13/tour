/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    mutation AuthenticateWithTma($input: TMAAuthInput!) {\n      authenticateWithTma(input: $input) {\n        isNewUser\n        accessToken\n        refreshToken\n      }\n    }\n  ": typeof types.AuthenticateWithTmaDocument,
    "\n    query Me {\n      me {\n        id\n        email\n        name\n        roles\n        telegram {\n          telegramId\n          firstName\n          lastName\n          username\n          photoUrl\n          authDate\n        }\n      }\n    }\n  ": typeof types.MeDocument,
    "\n    mutation CreateBooking($input: CreateBookingInput!) {\n      createBooking(input: $input) {\n        id\n        firstName\n        lastName\n        phoneNumber\n        telegram\n        whatsapp\n        extraPhoneNumber\n        extraTelegram\n        extraWhatsapp\n        travelDate\n        seatsCount\n        status\n        createdAt\n        updatedAt\n        direction\n        route {\n          price\n          departureCity {\n            name\n          }\n          arrivalCity {\n            name\n          }\n        }\n      }\n    }\n  ": typeof types.CreateBookingDocument,
    "\n    query GetArrivalCities($cityId: ID, $includeInactiveCities: Boolean) {\n      arrivalCities(\n        cityId: $cityId\n        includeInactiveCities: $includeInactiveCities\n      ) {\n        id\n        name\n      }\n    }\n  ": typeof types.GetArrivalCitiesDocument,
    "\n    query GetCities {\n      cities {\n        id\n        name\n      }\n    }\n  ": typeof types.GetCitiesDocument,
    "\n    query GetDepartureCities($includeInactiveCities: Boolean) {\n      departureCities(includeInactiveCities: $includeInactiveCities) {\n        id\n        name\n      }\n    }\n  ": typeof types.GetDepartureCitiesDocument,
    "\n    query GetRouteByIds($departureCityId: ID, $arrivalCityId: ID) {\n      routeByIds(\n        departureCityId: $departureCityId\n        arrivalCityId: $arrivalCityId\n      ) {\n        id\n        departureCity {\n          id\n          name\n          description\n        }\n        arrivalCity {\n          id\n          name\n          description\n        }\n        region {\n          id\n          name\n        }\n        isActive\n        departureDate\n        price\n        photoName\n        direction\n      }\n    }\n  ": typeof types.GetRouteByIdsDocument,
    "\n        mutation RefreshToken {\n          refreshToken {\n            accessToken\n            refreshToken\n          }\n        }\n      ": typeof types.RefreshTokenDocument,
};
const documents: Documents = {
    "\n    mutation AuthenticateWithTma($input: TMAAuthInput!) {\n      authenticateWithTma(input: $input) {\n        isNewUser\n        accessToken\n        refreshToken\n      }\n    }\n  ": types.AuthenticateWithTmaDocument,
    "\n    query Me {\n      me {\n        id\n        email\n        name\n        roles\n        telegram {\n          telegramId\n          firstName\n          lastName\n          username\n          photoUrl\n          authDate\n        }\n      }\n    }\n  ": types.MeDocument,
    "\n    mutation CreateBooking($input: CreateBookingInput!) {\n      createBooking(input: $input) {\n        id\n        firstName\n        lastName\n        phoneNumber\n        telegram\n        whatsapp\n        extraPhoneNumber\n        extraTelegram\n        extraWhatsapp\n        travelDate\n        seatsCount\n        status\n        createdAt\n        updatedAt\n        direction\n        route {\n          price\n          departureCity {\n            name\n          }\n          arrivalCity {\n            name\n          }\n        }\n      }\n    }\n  ": types.CreateBookingDocument,
    "\n    query GetArrivalCities($cityId: ID, $includeInactiveCities: Boolean) {\n      arrivalCities(\n        cityId: $cityId\n        includeInactiveCities: $includeInactiveCities\n      ) {\n        id\n        name\n      }\n    }\n  ": types.GetArrivalCitiesDocument,
    "\n    query GetCities {\n      cities {\n        id\n        name\n      }\n    }\n  ": types.GetCitiesDocument,
    "\n    query GetDepartureCities($includeInactiveCities: Boolean) {\n      departureCities(includeInactiveCities: $includeInactiveCities) {\n        id\n        name\n      }\n    }\n  ": types.GetDepartureCitiesDocument,
    "\n    query GetRouteByIds($departureCityId: ID, $arrivalCityId: ID) {\n      routeByIds(\n        departureCityId: $departureCityId\n        arrivalCityId: $arrivalCityId\n      ) {\n        id\n        departureCity {\n          id\n          name\n          description\n        }\n        arrivalCity {\n          id\n          name\n          description\n        }\n        region {\n          id\n          name\n        }\n        isActive\n        departureDate\n        price\n        photoName\n        direction\n      }\n    }\n  ": types.GetRouteByIdsDocument,
    "\n        mutation RefreshToken {\n          refreshToken {\n            accessToken\n            refreshToken\n          }\n        }\n      ": types.RefreshTokenDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AuthenticateWithTma($input: TMAAuthInput!) {\n      authenticateWithTma(input: $input) {\n        isNewUser\n        accessToken\n        refreshToken\n      }\n    }\n  "): (typeof documents)["\n    mutation AuthenticateWithTma($input: TMAAuthInput!) {\n      authenticateWithTma(input: $input) {\n        isNewUser\n        accessToken\n        refreshToken\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Me {\n      me {\n        id\n        email\n        name\n        roles\n        telegram {\n          telegramId\n          firstName\n          lastName\n          username\n          photoUrl\n          authDate\n        }\n      }\n    }\n  "): (typeof documents)["\n    query Me {\n      me {\n        id\n        email\n        name\n        roles\n        telegram {\n          telegramId\n          firstName\n          lastName\n          username\n          photoUrl\n          authDate\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CreateBooking($input: CreateBookingInput!) {\n      createBooking(input: $input) {\n        id\n        firstName\n        lastName\n        phoneNumber\n        telegram\n        whatsapp\n        extraPhoneNumber\n        extraTelegram\n        extraWhatsapp\n        travelDate\n        seatsCount\n        status\n        createdAt\n        updatedAt\n        direction\n        route {\n          price\n          departureCity {\n            name\n          }\n          arrivalCity {\n            name\n          }\n        }\n      }\n    }\n  "): (typeof documents)["\n    mutation CreateBooking($input: CreateBookingInput!) {\n      createBooking(input: $input) {\n        id\n        firstName\n        lastName\n        phoneNumber\n        telegram\n        whatsapp\n        extraPhoneNumber\n        extraTelegram\n        extraWhatsapp\n        travelDate\n        seatsCount\n        status\n        createdAt\n        updatedAt\n        direction\n        route {\n          price\n          departureCity {\n            name\n          }\n          arrivalCity {\n            name\n          }\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetArrivalCities($cityId: ID, $includeInactiveCities: Boolean) {\n      arrivalCities(\n        cityId: $cityId\n        includeInactiveCities: $includeInactiveCities\n      ) {\n        id\n        name\n      }\n    }\n  "): (typeof documents)["\n    query GetArrivalCities($cityId: ID, $includeInactiveCities: Boolean) {\n      arrivalCities(\n        cityId: $cityId\n        includeInactiveCities: $includeInactiveCities\n      ) {\n        id\n        name\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetCities {\n      cities {\n        id\n        name\n      }\n    }\n  "): (typeof documents)["\n    query GetCities {\n      cities {\n        id\n        name\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetDepartureCities($includeInactiveCities: Boolean) {\n      departureCities(includeInactiveCities: $includeInactiveCities) {\n        id\n        name\n      }\n    }\n  "): (typeof documents)["\n    query GetDepartureCities($includeInactiveCities: Boolean) {\n      departureCities(includeInactiveCities: $includeInactiveCities) {\n        id\n        name\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetRouteByIds($departureCityId: ID, $arrivalCityId: ID) {\n      routeByIds(\n        departureCityId: $departureCityId\n        arrivalCityId: $arrivalCityId\n      ) {\n        id\n        departureCity {\n          id\n          name\n          description\n        }\n        arrivalCity {\n          id\n          name\n          description\n        }\n        region {\n          id\n          name\n        }\n        isActive\n        departureDate\n        price\n        photoName\n        direction\n      }\n    }\n  "): (typeof documents)["\n    query GetRouteByIds($departureCityId: ID, $arrivalCityId: ID) {\n      routeByIds(\n        departureCityId: $departureCityId\n        arrivalCityId: $arrivalCityId\n      ) {\n        id\n        departureCity {\n          id\n          name\n          description\n        }\n        arrivalCity {\n          id\n          name\n          description\n        }\n        region {\n          id\n          name\n        }\n        isActive\n        departureDate\n        price\n        photoName\n        direction\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        mutation RefreshToken {\n          refreshToken {\n            accessToken\n            refreshToken\n          }\n        }\n      "): (typeof documents)["\n        mutation RefreshToken {\n          refreshToken {\n            accessToken\n            refreshToken\n          }\n        }\n      "];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;
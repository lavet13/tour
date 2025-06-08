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
const documents = {
    "\n    mutation Logout {\n      logout\n    }\n  ": types.LogoutDocument,
    "\n    mutation RefreshToken {\n      refreshToken {\n        accessToken\n        refreshToken\n      }\n    }\n  ": types.RefreshTokenDocument,
    "\n    mutation Login($loginInput: LoginInput!) {\n      login(loginInput: $loginInput) {\n        accessToken\n        refreshToken\n      }\n    }\n  ": types.LoginDocument,
    "\n    mutation AuthenticateWithTelegram($input: TelegramAuthInput!) {\n      authenticateWithTelegram(input: $input) {\n        isNewUser\n        accessToken\n        refreshToken\n      }\n    }\n  ": types.AuthenticateWithTelegramDocument,
    "\n    mutation UpdateTelegramChatIds($input: UpdateTelegramChatIdsInput!) {\n      updateTelegramChatIds(input: $input)\n    }\n  ": types.UpdateTelegramChatIdsDocument,
    "\n    query Me {\n      me {\n        id\n        email\n        name\n        roles\n        telegram {\n          telegramId\n          firstName\n          lastName\n          username\n          photoUrl\n          authDate\n          hash\n        }\n      }\n    }\n  ": types.MeDocument,
    "\n    query TelegramChatIds {\n      telegramChats {\n        chatId\n      }\n    }\n  ": types.TelegramChatIdsDocument,
    "\n    mutation UpdateBooking($input: UpdateBookingInput!) {\n      updateBooking(input: $input) {\n        id\n        firstName\n        lastName\n        phoneNumber\n        travelDate\n        seatsCount\n        status\n        createdAt\n        updatedAt\n      }\n    }\n  ": types.UpdateBookingDocument,
    "\n    mutation CreateBooking($input: CreateBookingInput!) {\n      createBooking(input: $input) {\n        id\n        firstName\n        lastName\n        phoneNumber\n        travelDate\n        seatsCount\n        status\n        createdAt\n        updatedAt\n        telegram\n        whatsapp\n      }\n    }\n  ": types.CreateBookingDocument,
    "\n    query InfiniteBookings($input: BookingsInput!) {\n      bookings(input: $input) {\n        edges {\n          id\n          firstName\n          lastName\n          phoneNumber\n          telegram\n          whatsapp\n          extraPhoneNumber\n          extraTelegram\n          extraWhatsapp\n          direction\n          travelDate\n          seatsCount\n          route {\n            id\n            arrivalCity {\n              name\n            }\n            departureCity {\n              name\n            }\n          }\n          status\n          createdAt\n          updatedAt\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n\n          startCursor\n          hasPreviousPage\n        }\n      }\n    }\n  ": types.InfiniteBookingsDocument,
    "\n    subscription CreatedBookingSubscription {\n      createdBooking {\n        id\n      }\n    }\n  ": types.CreatedBookingSubscriptionDocument,
    "\n    query GetArrivalCities($cityId: ID, $includeInactiveCities: Boolean) {\n      arrivalCities(cityId: $cityId, includeInactiveCities: $includeInactiveCities) {\n        id\n        name\n      }\n    }\n  ": types.GetArrivalCitiesDocument,
    "\n    query GetCities {\n      cities {\n        id\n        name\n      }\n    }\n  ": types.GetCitiesDocument,
    "\n    query GetDepartureCities($includeInactiveCities: Boolean) {\n      departureCities(includeInactiveCities: $includeInactiveCities) {\n        id\n        name\n      }\n    }\n  ": types.GetDepartureCitiesDocument,
    "\n    query RegionByName($regionName: String!) {\n      regionByName(regionName: $regionName) {\n        id\n        name\n      }\n    }\n  ": types.RegionByNameDocument,
    "\n    query GetRegionForRoute($departureCityId: ID, $arrivalCityId: ID) {\n      regionForRoute(\n        departureCityId: $departureCityId\n        arrivalCityId: $arrivalCityId\n      ) {\n        id\n        name\n      }\n    }\n  ": types.GetRegionForRouteDocument,
    "\n    query Regions {\n      regions {\n        id\n        name\n      }\n    }\n  ": types.RegionsDocument,
    "\n    mutation UpdateRoute($id: ID!, $input: CreateRouteInput!) {\n      updateRoute(id: $id, input: $input) {\n        id\n        region {\n          id\n        }\n      }\n    }\n  ": types.UpdateRouteDocument,
    "\n    mutation CreateRoute($input: CreateRouteInput!) {\n      createRoute(input: $input) {\n        id\n        region {\n          id\n        }\n      }\n    }\n  ": types.CreateRouteDocument,
    "\n    mutation UploadPhotoRoute(\n      $file: File!\n      $isPhotoSelected: Boolean\n      $routeId: ID!\n    ) {\n      uploadPhotoRoute(\n        file: $file\n        isPhotoSelected: $isPhotoSelected\n        routeId: $routeId\n      ) {\n        photo\n        routeId\n        regionId\n      }\n    }\n  ": types.UploadPhotoRouteDocument,
    "\n    query GetRouteByIds($departureCityId: ID, $arrivalCityId: ID) {\n      routeByIds(\n        departureCityId: $departureCityId\n        arrivalCityId: $arrivalCityId\n      ) {\n        id\n        departureCity {\n          id\n          name\n          description\n        }\n        arrivalCity {\n          id\n          name\n          description\n        }\n        region {\n          id\n          name\n        }\n        isActive\n        departureDate\n        price\n        photoName\n        direction\n      }\n    }\n  ": types.GetRouteByIdsDocument,
    "\n    query GetRouteById($id: ID) {\n      routeById(id: $id) {\n        id\n        departureCity {\n          id\n          name\n        }\n        arrivalCity {\n          id\n          name\n        }\n        region {\n          id\n          name\n        }\n        isActive\n        departureDate\n        price\n        photoName\n      }\n    }\n  ": types.GetRouteByIdDocument,
    "\n    query InfiniteRoutes($input: RoutesInput!) {\n      infiniteRoutes(input: $input) {\n        edges {\n          id\n          departureCity {\n            id\n            name\n          }\n          region {\n            id\n            name\n          }\n          price\n          photoName\n          isActive\n          departureDate\n          arrivalCity {\n            id\n            name\n          }\n          createdAt\n          updatedAt\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n\n          startCursor\n          hasPreviousPage\n        }\n      }\n    }\n  ": types.InfiniteRoutesDocument,
    "\n    query GetRoutes($regionId: ID!) {\n      routes(regionId: $regionId) {\n        id\n        departureCity {\n          id\n          name\n        }\n        arrivalCity {\n          id\n          name\n        }\n        departureDate\n      }\n    }\n  ": types.GetRoutesDocument,
    "\n    query GetRoutesGallery($limit: Int, $offset: Int) {\n      routesGallery(limit: $limit, offset: $offset) {\n        totalCount\n        images\n      }\n    }\n  ": types.GetRoutesGalleryDocument,
    "\n    mutation UpdateSchedule($input: UpdateScheduleInput!) {\n      updateSchedule(input: $input) {\n        id\n        route {\n          id\n        }\n        isActive\n        direction\n        stopName\n        time\n        createdAt\n        updatedAt\n      }\n    }\n  ": types.UpdateScheduleDocument,
    "\n    mutation CreateSchedule($input: CreateScheduleInput!) {\n      createSchedule(input: $input) {\n        id\n        route {\n          id\n        }\n        isActive\n        direction\n        stopName\n        time\n        createdAt\n        updatedAt\n      }\n    }\n  ": types.CreateScheduleDocument,
    "\n    mutation DeleteSchedule($id: ID!) {\n      deleteSchedule(id: $id) {\n        route {\n          id\n        }\n      }\n    }\n  ": types.DeleteScheduleDocument,
    "\n    query GetSchedulesByRoute($routeId: ID, $direction: RouteDirection) {\n      schedulesByRoute(routeId: $routeId, direction: $direction) {\n        id\n        direction\n        stopName\n        time\n        isActive\n        createdAt\n        updatedAt\n        city {\n          id\n          name\n        }\n      }\n    }\n  ": types.GetSchedulesByRouteDocument,
    "\n    query GetScheduleById($scheduleId: ID) {\n      scheduleById(scheduleId: $scheduleId) {\n        id\n        direction\n        stopName\n        time\n        isActive\n      }\n    }\n  ": types.GetScheduleByIdDocument,
    "\n    query GetSchedulesByIds($departureCityId: ID, $arrivalCityId: ID) {\n      schedulesByIds(\n        departureCityId: $departureCityId\n        arrivalCityId: $arrivalCityId\n      ) {\n        city {\n          name\n        }\n        direction\n        stopName\n        time\n        isActive\n      }\n    }\n  ": types.GetSchedulesByIdsDocument,
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
export function graphql(source: "\n    mutation Logout {\n      logout\n    }\n  "): (typeof documents)["\n    mutation Logout {\n      logout\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RefreshToken {\n      refreshToken {\n        accessToken\n        refreshToken\n      }\n    }\n  "): (typeof documents)["\n    mutation RefreshToken {\n      refreshToken {\n        accessToken\n        refreshToken\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation Login($loginInput: LoginInput!) {\n      login(loginInput: $loginInput) {\n        accessToken\n        refreshToken\n      }\n    }\n  "): (typeof documents)["\n    mutation Login($loginInput: LoginInput!) {\n      login(loginInput: $loginInput) {\n        accessToken\n        refreshToken\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AuthenticateWithTelegram($input: TelegramAuthInput!) {\n      authenticateWithTelegram(input: $input) {\n        isNewUser\n        accessToken\n        refreshToken\n      }\n    }\n  "): (typeof documents)["\n    mutation AuthenticateWithTelegram($input: TelegramAuthInput!) {\n      authenticateWithTelegram(input: $input) {\n        isNewUser\n        accessToken\n        refreshToken\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation UpdateTelegramChatIds($input: UpdateTelegramChatIdsInput!) {\n      updateTelegramChatIds(input: $input)\n    }\n  "): (typeof documents)["\n    mutation UpdateTelegramChatIds($input: UpdateTelegramChatIdsInput!) {\n      updateTelegramChatIds(input: $input)\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Me {\n      me {\n        id\n        email\n        name\n        roles\n        telegram {\n          telegramId\n          firstName\n          lastName\n          username\n          photoUrl\n          authDate\n          hash\n        }\n      }\n    }\n  "): (typeof documents)["\n    query Me {\n      me {\n        id\n        email\n        name\n        roles\n        telegram {\n          telegramId\n          firstName\n          lastName\n          username\n          photoUrl\n          authDate\n          hash\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query TelegramChatIds {\n      telegramChats {\n        chatId\n      }\n    }\n  "): (typeof documents)["\n    query TelegramChatIds {\n      telegramChats {\n        chatId\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation UpdateBooking($input: UpdateBookingInput!) {\n      updateBooking(input: $input) {\n        id\n        firstName\n        lastName\n        phoneNumber\n        travelDate\n        seatsCount\n        status\n        createdAt\n        updatedAt\n      }\n    }\n  "): (typeof documents)["\n    mutation UpdateBooking($input: UpdateBookingInput!) {\n      updateBooking(input: $input) {\n        id\n        firstName\n        lastName\n        phoneNumber\n        travelDate\n        seatsCount\n        status\n        createdAt\n        updatedAt\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CreateBooking($input: CreateBookingInput!) {\n      createBooking(input: $input) {\n        id\n        firstName\n        lastName\n        phoneNumber\n        travelDate\n        seatsCount\n        status\n        createdAt\n        updatedAt\n        telegram\n        whatsapp\n      }\n    }\n  "): (typeof documents)["\n    mutation CreateBooking($input: CreateBookingInput!) {\n      createBooking(input: $input) {\n        id\n        firstName\n        lastName\n        phoneNumber\n        travelDate\n        seatsCount\n        status\n        createdAt\n        updatedAt\n        telegram\n        whatsapp\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query InfiniteBookings($input: BookingsInput!) {\n      bookings(input: $input) {\n        edges {\n          id\n          firstName\n          lastName\n          phoneNumber\n          telegram\n          whatsapp\n          extraPhoneNumber\n          extraTelegram\n          extraWhatsapp\n          direction\n          travelDate\n          seatsCount\n          route {\n            id\n            arrivalCity {\n              name\n            }\n            departureCity {\n              name\n            }\n          }\n          status\n          createdAt\n          updatedAt\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n\n          startCursor\n          hasPreviousPage\n        }\n      }\n    }\n  "): (typeof documents)["\n    query InfiniteBookings($input: BookingsInput!) {\n      bookings(input: $input) {\n        edges {\n          id\n          firstName\n          lastName\n          phoneNumber\n          telegram\n          whatsapp\n          extraPhoneNumber\n          extraTelegram\n          extraWhatsapp\n          direction\n          travelDate\n          seatsCount\n          route {\n            id\n            arrivalCity {\n              name\n            }\n            departureCity {\n              name\n            }\n          }\n          status\n          createdAt\n          updatedAt\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n\n          startCursor\n          hasPreviousPage\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    subscription CreatedBookingSubscription {\n      createdBooking {\n        id\n      }\n    }\n  "): (typeof documents)["\n    subscription CreatedBookingSubscription {\n      createdBooking {\n        id\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetArrivalCities($cityId: ID, $includeInactiveCities: Boolean) {\n      arrivalCities(cityId: $cityId, includeInactiveCities: $includeInactiveCities) {\n        id\n        name\n      }\n    }\n  "): (typeof documents)["\n    query GetArrivalCities($cityId: ID, $includeInactiveCities: Boolean) {\n      arrivalCities(cityId: $cityId, includeInactiveCities: $includeInactiveCities) {\n        id\n        name\n      }\n    }\n  "];
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
export function graphql(source: "\n    query RegionByName($regionName: String!) {\n      regionByName(regionName: $regionName) {\n        id\n        name\n      }\n    }\n  "): (typeof documents)["\n    query RegionByName($regionName: String!) {\n      regionByName(regionName: $regionName) {\n        id\n        name\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetRegionForRoute($departureCityId: ID, $arrivalCityId: ID) {\n      regionForRoute(\n        departureCityId: $departureCityId\n        arrivalCityId: $arrivalCityId\n      ) {\n        id\n        name\n      }\n    }\n  "): (typeof documents)["\n    query GetRegionForRoute($departureCityId: ID, $arrivalCityId: ID) {\n      regionForRoute(\n        departureCityId: $departureCityId\n        arrivalCityId: $arrivalCityId\n      ) {\n        id\n        name\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Regions {\n      regions {\n        id\n        name\n      }\n    }\n  "): (typeof documents)["\n    query Regions {\n      regions {\n        id\n        name\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation UpdateRoute($id: ID!, $input: CreateRouteInput!) {\n      updateRoute(id: $id, input: $input) {\n        id\n        region {\n          id\n        }\n      }\n    }\n  "): (typeof documents)["\n    mutation UpdateRoute($id: ID!, $input: CreateRouteInput!) {\n      updateRoute(id: $id, input: $input) {\n        id\n        region {\n          id\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CreateRoute($input: CreateRouteInput!) {\n      createRoute(input: $input) {\n        id\n        region {\n          id\n        }\n      }\n    }\n  "): (typeof documents)["\n    mutation CreateRoute($input: CreateRouteInput!) {\n      createRoute(input: $input) {\n        id\n        region {\n          id\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation UploadPhotoRoute(\n      $file: File!\n      $isPhotoSelected: Boolean\n      $routeId: ID!\n    ) {\n      uploadPhotoRoute(\n        file: $file\n        isPhotoSelected: $isPhotoSelected\n        routeId: $routeId\n      ) {\n        photo\n        routeId\n        regionId\n      }\n    }\n  "): (typeof documents)["\n    mutation UploadPhotoRoute(\n      $file: File!\n      $isPhotoSelected: Boolean\n      $routeId: ID!\n    ) {\n      uploadPhotoRoute(\n        file: $file\n        isPhotoSelected: $isPhotoSelected\n        routeId: $routeId\n      ) {\n        photo\n        routeId\n        regionId\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetRouteByIds($departureCityId: ID, $arrivalCityId: ID) {\n      routeByIds(\n        departureCityId: $departureCityId\n        arrivalCityId: $arrivalCityId\n      ) {\n        id\n        departureCity {\n          id\n          name\n          description\n        }\n        arrivalCity {\n          id\n          name\n          description\n        }\n        region {\n          id\n          name\n        }\n        isActive\n        departureDate\n        price\n        photoName\n        direction\n      }\n    }\n  "): (typeof documents)["\n    query GetRouteByIds($departureCityId: ID, $arrivalCityId: ID) {\n      routeByIds(\n        departureCityId: $departureCityId\n        arrivalCityId: $arrivalCityId\n      ) {\n        id\n        departureCity {\n          id\n          name\n          description\n        }\n        arrivalCity {\n          id\n          name\n          description\n        }\n        region {\n          id\n          name\n        }\n        isActive\n        departureDate\n        price\n        photoName\n        direction\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetRouteById($id: ID) {\n      routeById(id: $id) {\n        id\n        departureCity {\n          id\n          name\n        }\n        arrivalCity {\n          id\n          name\n        }\n        region {\n          id\n          name\n        }\n        isActive\n        departureDate\n        price\n        photoName\n      }\n    }\n  "): (typeof documents)["\n    query GetRouteById($id: ID) {\n      routeById(id: $id) {\n        id\n        departureCity {\n          id\n          name\n        }\n        arrivalCity {\n          id\n          name\n        }\n        region {\n          id\n          name\n        }\n        isActive\n        departureDate\n        price\n        photoName\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query InfiniteRoutes($input: RoutesInput!) {\n      infiniteRoutes(input: $input) {\n        edges {\n          id\n          departureCity {\n            id\n            name\n          }\n          region {\n            id\n            name\n          }\n          price\n          photoName\n          isActive\n          departureDate\n          arrivalCity {\n            id\n            name\n          }\n          createdAt\n          updatedAt\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n\n          startCursor\n          hasPreviousPage\n        }\n      }\n    }\n  "): (typeof documents)["\n    query InfiniteRoutes($input: RoutesInput!) {\n      infiniteRoutes(input: $input) {\n        edges {\n          id\n          departureCity {\n            id\n            name\n          }\n          region {\n            id\n            name\n          }\n          price\n          photoName\n          isActive\n          departureDate\n          arrivalCity {\n            id\n            name\n          }\n          createdAt\n          updatedAt\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n\n          startCursor\n          hasPreviousPage\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetRoutes($regionId: ID!) {\n      routes(regionId: $regionId) {\n        id\n        departureCity {\n          id\n          name\n        }\n        arrivalCity {\n          id\n          name\n        }\n        departureDate\n      }\n    }\n  "): (typeof documents)["\n    query GetRoutes($regionId: ID!) {\n      routes(regionId: $regionId) {\n        id\n        departureCity {\n          id\n          name\n        }\n        arrivalCity {\n          id\n          name\n        }\n        departureDate\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetRoutesGallery($limit: Int, $offset: Int) {\n      routesGallery(limit: $limit, offset: $offset) {\n        totalCount\n        images\n      }\n    }\n  "): (typeof documents)["\n    query GetRoutesGallery($limit: Int, $offset: Int) {\n      routesGallery(limit: $limit, offset: $offset) {\n        totalCount\n        images\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation UpdateSchedule($input: UpdateScheduleInput!) {\n      updateSchedule(input: $input) {\n        id\n        route {\n          id\n        }\n        isActive\n        direction\n        stopName\n        time\n        createdAt\n        updatedAt\n      }\n    }\n  "): (typeof documents)["\n    mutation UpdateSchedule($input: UpdateScheduleInput!) {\n      updateSchedule(input: $input) {\n        id\n        route {\n          id\n        }\n        isActive\n        direction\n        stopName\n        time\n        createdAt\n        updatedAt\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CreateSchedule($input: CreateScheduleInput!) {\n      createSchedule(input: $input) {\n        id\n        route {\n          id\n        }\n        isActive\n        direction\n        stopName\n        time\n        createdAt\n        updatedAt\n      }\n    }\n  "): (typeof documents)["\n    mutation CreateSchedule($input: CreateScheduleInput!) {\n      createSchedule(input: $input) {\n        id\n        route {\n          id\n        }\n        isActive\n        direction\n        stopName\n        time\n        createdAt\n        updatedAt\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation DeleteSchedule($id: ID!) {\n      deleteSchedule(id: $id) {\n        route {\n          id\n        }\n      }\n    }\n  "): (typeof documents)["\n    mutation DeleteSchedule($id: ID!) {\n      deleteSchedule(id: $id) {\n        route {\n          id\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetSchedulesByRoute($routeId: ID, $direction: RouteDirection) {\n      schedulesByRoute(routeId: $routeId, direction: $direction) {\n        id\n        direction\n        stopName\n        time\n        isActive\n        createdAt\n        updatedAt\n        city {\n          id\n          name\n        }\n      }\n    }\n  "): (typeof documents)["\n    query GetSchedulesByRoute($routeId: ID, $direction: RouteDirection) {\n      schedulesByRoute(routeId: $routeId, direction: $direction) {\n        id\n        direction\n        stopName\n        time\n        isActive\n        createdAt\n        updatedAt\n        city {\n          id\n          name\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetScheduleById($scheduleId: ID) {\n      scheduleById(scheduleId: $scheduleId) {\n        id\n        direction\n        stopName\n        time\n        isActive\n      }\n    }\n  "): (typeof documents)["\n    query GetScheduleById($scheduleId: ID) {\n      scheduleById(scheduleId: $scheduleId) {\n        id\n        direction\n        stopName\n        time\n        isActive\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetSchedulesByIds($departureCityId: ID, $arrivalCityId: ID) {\n      schedulesByIds(\n        departureCityId: $departureCityId\n        arrivalCityId: $arrivalCityId\n      ) {\n        city {\n          name\n        }\n        direction\n        stopName\n        time\n        isActive\n      }\n    }\n  "): (typeof documents)["\n    query GetSchedulesByIds($departureCityId: ID, $arrivalCityId: ID) {\n      schedulesByIds(\n        departureCityId: $departureCityId\n        arrivalCityId: $arrivalCityId\n      ) {\n        city {\n          name\n        }\n        direction\n        stopName\n        time\n        isActive\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        mutation RefreshToken {\n          refreshToken {\n            accessToken\n            refreshToken\n          }\n        }\n      "): (typeof documents)["\n        mutation RefreshToken {\n          refreshToken {\n            accessToken\n            refreshToken\n          }\n        }\n      "];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;
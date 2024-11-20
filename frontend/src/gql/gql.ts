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
    "\n    query Me {\n      me {\n        id\n        email\n        name\n        roles\n      }\n    }\n  ": types.MeDocument,
    "\n    mutation Login($loginInput: LoginInput!) {\n      login(loginInput: $loginInput) {\n        accessToken\n        refreshToken\n      }\n    }\n  ": types.LoginDocument,
    "\n    mutation Logout {\n      logout\n    }\n  ": types.LogoutDocument,
    "\n    mutation RefreshToken {\n      refreshToken {\n        accessToken\n        refreshToken\n      }\n    }\n  ": types.RefreshTokenDocument,
    "\n    mutation Register($signupInput: SignupInput!) {\n      signup(signupInput: $signupInput) {\n        accessToken\n        refreshToken\n      }\n    }\n  ": types.RegisterDocument,
    "\n    mutation CreateWbOrder($input: WbOrderInput!) {\n      saveWbOrder(input: $input) {\n        id\n        name\n        phone\n        orderCode\n        qrCode\n        qrCodeFile\n        wbPhone\n        status\n      }\n    }\n  ": types.CreateWbOrderDocument,
    "\n    mutation UpdateWbOrder($input: UpdateWbInput!) {\n      updateWbOrder(input: $input) {\n        id\n        name\n        phone\n        qrCode\n        orderCode\n        wbPhone\n        status\n        createdAt\n        updatedAt\n      }\n    }\n  ": types.UpdateWbOrderDocument,
    "\n    query WbOrderById($id: BigInt!) {\n      wbOrderById(id: $id) {\n        id\n        name\n        phone\n        qrCode\n        orderCode\n        wbPhone\n        status\n        createdAt\n        updatedAt\n      }\n    }\n  ": types.WbOrderByIdDocument,
    "\n    query WbOrders($input: WbOrdersInput!) {\n      wbOrders(input: $input) {\n        edges {\n          id\n          name\n          phone\n          qrCode\n          orderCode\n          wbPhone\n          status\n          createdAt\n          updatedAt\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n\n          startCursor\n          hasPreviousPage\n        }\n      }\n    }\n  ": types.WbOrdersDocument,
    "\n        mutation RefreshToken {\n          refreshToken {\n            accessToken\n            refreshToken\n          }\n        }\n      ": types.RefreshTokenDocument,
    "\n    subscription NewWbOrderSubscription {\n      newWbOrder {\n        id\n        name\n        phone\n        qrCode\n        qrCodeFile\n        orderCode\n        wbPhone\n        status\n      }\n    }\n  ": types.NewWbOrderSubscriptionDocument,
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
export function graphql(source: "\n    query Me {\n      me {\n        id\n        email\n        name\n        roles\n      }\n    }\n  "): (typeof documents)["\n    query Me {\n      me {\n        id\n        email\n        name\n        roles\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation Login($loginInput: LoginInput!) {\n      login(loginInput: $loginInput) {\n        accessToken\n        refreshToken\n      }\n    }\n  "): (typeof documents)["\n    mutation Login($loginInput: LoginInput!) {\n      login(loginInput: $loginInput) {\n        accessToken\n        refreshToken\n      }\n    }\n  "];
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
export function graphql(source: "\n    mutation Register($signupInput: SignupInput!) {\n      signup(signupInput: $signupInput) {\n        accessToken\n        refreshToken\n      }\n    }\n  "): (typeof documents)["\n    mutation Register($signupInput: SignupInput!) {\n      signup(signupInput: $signupInput) {\n        accessToken\n        refreshToken\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CreateWbOrder($input: WbOrderInput!) {\n      saveWbOrder(input: $input) {\n        id\n        name\n        phone\n        orderCode\n        qrCode\n        qrCodeFile\n        wbPhone\n        status\n      }\n    }\n  "): (typeof documents)["\n    mutation CreateWbOrder($input: WbOrderInput!) {\n      saveWbOrder(input: $input) {\n        id\n        name\n        phone\n        orderCode\n        qrCode\n        qrCodeFile\n        wbPhone\n        status\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation UpdateWbOrder($input: UpdateWbInput!) {\n      updateWbOrder(input: $input) {\n        id\n        name\n        phone\n        qrCode\n        orderCode\n        wbPhone\n        status\n        createdAt\n        updatedAt\n      }\n    }\n  "): (typeof documents)["\n    mutation UpdateWbOrder($input: UpdateWbInput!) {\n      updateWbOrder(input: $input) {\n        id\n        name\n        phone\n        qrCode\n        orderCode\n        wbPhone\n        status\n        createdAt\n        updatedAt\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query WbOrderById($id: BigInt!) {\n      wbOrderById(id: $id) {\n        id\n        name\n        phone\n        qrCode\n        orderCode\n        wbPhone\n        status\n        createdAt\n        updatedAt\n      }\n    }\n  "): (typeof documents)["\n    query WbOrderById($id: BigInt!) {\n      wbOrderById(id: $id) {\n        id\n        name\n        phone\n        qrCode\n        orderCode\n        wbPhone\n        status\n        createdAt\n        updatedAt\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query WbOrders($input: WbOrdersInput!) {\n      wbOrders(input: $input) {\n        edges {\n          id\n          name\n          phone\n          qrCode\n          orderCode\n          wbPhone\n          status\n          createdAt\n          updatedAt\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n\n          startCursor\n          hasPreviousPage\n        }\n      }\n    }\n  "): (typeof documents)["\n    query WbOrders($input: WbOrdersInput!) {\n      wbOrders(input: $input) {\n        edges {\n          id\n          name\n          phone\n          qrCode\n          orderCode\n          wbPhone\n          status\n          createdAt\n          updatedAt\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n\n          startCursor\n          hasPreviousPage\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        mutation RefreshToken {\n          refreshToken {\n            accessToken\n            refreshToken\n          }\n        }\n      "): (typeof documents)["\n        mutation RefreshToken {\n          refreshToken {\n            accessToken\n            refreshToken\n          }\n        }\n      "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    subscription NewWbOrderSubscription {\n      newWbOrder {\n        id\n        name\n        phone\n        qrCode\n        qrCodeFile\n        orderCode\n        wbPhone\n        status\n      }\n    }\n  "): (typeof documents)["\n    subscription NewWbOrderSubscription {\n      newWbOrder {\n        id\n        name\n        phone\n        qrCode\n        qrCodeFile\n        orderCode\n        wbPhone\n        status\n      }\n    }\n  "];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;
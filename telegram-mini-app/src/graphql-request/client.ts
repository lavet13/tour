import {
  gql,
  GraphQLClient,
  RequestDocument,
  RawRequestOptions,
  Variables,
  RequestOptions,
} from 'graphql-request';
type GraphQLClientRequestHeaders = RawRequestOptions['requestHeaders'];
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { RefreshTokenMutation } from '@/gql/graphql';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';

class AuthenticatedGraphQLClient extends GraphQLClient {
  private refreshTokenPromise: Promise<RefreshTokenMutation> | null = null;

  async request<T = any, V extends Variables = Variables>(
    document: RequestDocument | TypedDocumentNode<T, V>,
    ...variablesAndRequestHeaders: V extends Record<any, never>
      ? [variables?: V, requestHeaders?: GraphQLClientRequestHeaders]
      : keyof V extends never
        ? [variables?: V, requestHeaders?: GraphQLClientRequestHeaders]
        : [variables: V, requestHeaders?: GraphQLClientRequestHeaders]
  ): Promise<T>;
  async request<T = any, V extends Variables = Variables>(
    options: RequestOptions<V, T>,
  ): Promise<T>;
  async request<T = any, V extends Variables = Variables>(
    documentOrOptions:
      | RequestDocument
      | TypedDocumentNode<T, V>
      | RequestOptions<V, T>,
    ...variablesAndRequestHeaders: any[]
  ): Promise<T> {
    import.meta.env.DEV && console.log({ variablesAndRequestHeaders });

    try {
      return await (super.request as any)(
        documentOrOptions,
        ...variablesAndRequestHeaders,
      );
    } catch (error: any) {
      import.meta.env.DEV && console.log({ error });
      if (
        isGraphQLRequestError(error) &&
        error.response?.errors?.[0]?.extensions?.code === 'TOKEN_EXPIRED'
      ) {
        await this.refreshTokens();
        return await (super.request as any)(
          documentOrOptions,
          ...variablesAndRequestHeaders,
        );
      }
      throw error;
    }
  }

  private async refreshTokens(): Promise<void> {
    if (!this.refreshTokenPromise) {
      this.refreshTokenPromise = super.request<RefreshTokenMutation>(gql`
        mutation RefreshToken {
          refreshToken {
            accessToken
            refreshToken
          }
        }
      `);
    }

    try {
      const { refreshToken } = await this.refreshTokenPromise;

      console.log({ refreshToken });
    } catch (error) {
      console.error('Failed to refresh token: ', error);
      this.refreshTokenPromise = null;
      throw error;
    } finally {
      this.refreshTokenPromise = null;
    }
  }
}

export type AbortHandler = XMLHttpRequest['abort'];

export const client = new AuthenticatedGraphQLClient(
  import.meta.env.DEV
    ? import.meta.env.VITE_GRAPHQL_URI_DEV
    : import.meta.env.VITE_GRAPHQL_URI,
  {
    mode: 'cors',
    credentials: 'include',
  },
);


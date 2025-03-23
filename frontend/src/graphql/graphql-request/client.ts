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
import { requestMiddlewareUploadFiles } from './request-middleware-upload-files';

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

interface CustomFetchOptions extends RequestInit {
  progressCallback?: (percent: string) => void;
  onAbortPossible?: (abortHandler: AbortHandler) => void;
}

type OnloadOptions = {
  status: number;
  statusText: string;
  headers: Headers;
} & Record<string, any>;

const parseHeaders = (rawHeaders: string): Headers => {
  const headers = new Headers();
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
  preProcessedHeaders.split(/\r?\n/).forEach((line: string) => {
    const parts = line.split(':');
    const key = parts.shift()?.trim();
    if (key) {
      const value = parts.join(':').trim();
      headers.append(key, value);
    }
  });
  return headers;
};

const customFetch = async (
  url: URL | RequestInfo,
  opts: CustomFetchOptions = {},
): Promise<Response> => {
  if (opts.progressCallback) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(opts.method || '', url as string, true);

      Object.keys(opts.headers as Headers).forEach(key => {
        const headerValue = opts.headers
          ? (opts.headers[key as keyof HeadersInit] as string)
          : '';
        xhr.setRequestHeader(key, headerValue);
      });

      // Track upload progress
      xhr.upload.onprogress = event => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;

          opts.progressCallback?.(percentComplete.toFixed());
        }
      };

      opts.onAbortPossible?.(() => {
        xhr.abort();
      });

      // Handle response
      xhr.onload = () => {
        const opts: OnloadOptions = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || ''),
        };
        opts.url =
          'responseURL' in xhr
            ? xhr.responseURL
            : opts.headers.get('X-Request-URL');
        const body =
          'response' in xhr ? xhr.response : (xhr as any).responseText;

        resolve(new Response(body, opts));
      };

      // Handle errors
      xhr.onerror = () => reject(new TypeError('Network request failed'));
      xhr.ontimeout = () => reject(new TypeError('Network request timed out'));
      xhr.onabort = () => reject(new TypeError('Network request aborted'));

      // Send the request
      xhr.send(
        opts.body as XMLHttpRequestBodyInit | Document | null | undefined,
      );
    });
  }

  return fetch(url, opts);
};

export const client = new AuthenticatedGraphQLClient(
  import.meta.env.DEV
    ? import.meta.env.VITE_GRAPHQL_URI_DEV
    : import.meta.env.VITE_GRAPHQL_URI,
  {
    requestMiddleware: requestMiddlewareUploadFiles,
    mode: 'cors',
    credentials: 'include',
    fetch: customFetch,
  },
);

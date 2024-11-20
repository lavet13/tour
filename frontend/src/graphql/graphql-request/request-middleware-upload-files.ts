import { RequestInitExtended, RequestMiddleware } from 'graphql-request';
import { set, isArray } from 'lodash-es';
import { AbortHandler } from '@/graphql/graphql-request/client';

const isExtractableFile = <ValueType>(value: ValueType) => {
  return (
    (typeof File !== 'undefined' && value instanceof File) ||
    (typeof Blob !== 'undefined' && value instanceof Blob) ||
    (typeof Buffer !== 'undefined' && value instanceof Buffer) ||
    (typeof value === `object` &&
      value !== null &&
      `pipe` in value &&
      typeof value.pipe === `function`)
  );
};

//@ts-ignore
const isPlainObject = <T>(value: T): value is Object => value && [undefined, Object].includes(value.constructor);
const recursiveExtractFiles = (
  variableKey: string,
  variableValue: any,
  prefix: string,
): any => {
  if (isExtractableFile(variableValue)) {
    return [
      {
        variableKey: [`${prefix}.${variableKey}`],
        file: variableValue,
      },
    ];
  }

  if (
    isArray(variableValue) &&
    variableValue.every(item => isExtractableFile(item))
  ) {
    return variableValue.map((file, fileIndex) => {
      return {
        variableKey: [`${prefix}.${variableKey}.${fileIndex}`],
        file,
      };
    });
  }

  if (isPlainObject(variableValue)) {
    const ggg = Object.entries(variableValue)
      .map(([key, value]: any) =>
        recursiveExtractFiles(key, value, `${prefix}.${variableKey}`),
      )
      .flat();

    return ggg;
  }

  return [];
};

type Request = RequestInitExtended & {
  variables?: {
    progressCallback?: (percent: string) => void;
    onAbortPossible?: (abortHandler: AbortHandler) => void;
  };
};

export const requestMiddlewareUploadFiles: RequestMiddleware = async (
  request: Request,
) => {
  const files = Object.entries(request.variables || {}).flatMap(
    ([variableKey, variableValue]) => {
      return recursiveExtractFiles(variableKey, variableValue, 'variables');
    },
  );

  if (!files.length) {
    return request;
  }

  const form = new FormData();
  const parsedBody = JSON.parse(request.body as string);
  for (const file of files) {
    //remove file here to reduce request size
    set(parsedBody, file.variableKey[0], null);
  }
  form.append('operations', JSON.stringify(parsedBody));

  const map = files.reduce((accumulator, { variableKey }, index) => {
    return {
      ...accumulator,
      [index.toString()]: variableKey,
    };
  }, {});

  form.append('map', JSON.stringify(map));

  for (let index = 0; index < files.length; index++) {
    const { file } = files[index];
    // form.append(index.toString(), await toBlob(file.file));
    form.append(index.toString(), file);
  }

  const { 'Content-Type': _, ...newHeaders } = request.headers as Record<
    string,
    string
  >;

  const progressCallback = request.variables?.progressCallback;
  const onAbortPossible = request.variables?.onAbortPossible;
  console.log({ progressCallback, onAbortPossible });

  return {
    ...request,
    body: form,
    headers: newHeaders,
    progressCallback,
    onAbortPossible,
  };
};

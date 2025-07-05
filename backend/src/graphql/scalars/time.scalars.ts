import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

const padRangeTime = (value: string) => {
  const padTime = (value: string) => {
    return value.replace(/^(\d):/, '0$1');
  };

  if (value.includes(' - ')) {
    const parts = value.split(' - ');
    return parts.map(time => padTime(time)).join(' - ');
  }

  return padTime(value);
};

const validateTimeOrRange = (value: string): boolean => {
  const validateTime = (value: string): boolean => {
    const TIME_REGEX = /^([0-1])?[0-9]|2[0-3]:[0-5][0-9]$/;
    return TIME_REGEX.test(value);
  };

  // check if it's a range (contains ' - ')
  if (value.includes(' - ')) {
    const parts = value.split(' - ');
    if (parts.length !== 2) {
      return false;
    }

    const [startTime, endTime] = parts;
    return validateTime(startTime) && validateTime(endTime);
  }

  // if not a range, validate as single time
  return validateTime(value);
};

export const TimeResolver = new GraphQLScalarType({
  name: 'Time',
  description: 'Time custom scalar type with format HH:mm',
  // serialize is used to convert internal values to output format when sending
  // data to clients
  serialize(value) {
    if (typeof value !== 'string') {
      throw new GraphQLError(
        'GraphQL `Time` scalar represents non string type',
      );
    }

    if (validateTimeOrRange(value)) {
      return padRangeTime(value);
    }

    throw new GraphQLError(
      'GraphQL `Time` scalar serializer expected a format `HH:mm` or `HH:mm - HH:mm`',
    );
  },
  // This is called when clients send time values through query variables
  parseValue(value) {
    if (typeof value !== 'string') {
      throw new GraphQLError(
        `Time cannot represent non string type ${JSON.stringify(value)}`,
      );
    }

    // Handle various input types from client
    if (validateTimeOrRange(value)) {
      return padRangeTime(value);
    }

    throw new GraphQLError(
      'GraphQL `Time` scalar parser expected a valid format `HH:mm` or `HH:mm - HH:mm`',
    );
  },
  // Processes time values written directly in the query string
  // (not through variables)
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(
        `Time cannot represent non string type ${'value' in ast && ast.value}`,
        { nodes: ast },
      );
    }

    const value = ast.value;
    if (validateTimeOrRange(value)) {
      return padRangeTime(value);
    }

    throw new GraphQLError(
      'GraphQL `Time` scalar  Invalid time format. Use `HH:mm` or `HH:mm - HH:mm`',
      { nodes: ast },
    );
  },
  extensions: {
    codegenScalarType: 'string',
    jsonSchema: {
      type: 'string',
      format: 'time',
    },
  },
});

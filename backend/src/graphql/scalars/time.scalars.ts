import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

const validateTime = (time: string | null | undefined): boolean => {
  if (!time) return false;
  const TIME_REGEX = /^([01]\d|2[0-3]):([0-5][0-9])$/;
  return TIME_REGEX.test(time);
};

export const TimeResolver = new GraphQLScalarType({
  name: 'Time',
  description: 'Time custom scalar type with format HH:mm',
  serialize(value) {
    if (typeof value === 'string' && validateTime(value)) {
      return value;
    }

    throw new GraphQLError(
      'GraphQL `Time` scalar serializer expected a format `HH:mm`',
    );
  },
  parseValue(value) {
    if (!(typeof value === 'string')) {
      throw new GraphQLError(
        `Time cannot represent non string type ${JSON.stringify(value)}`,
      );
    }

    // Handle various input types from client
    if (validateTime(value)) {
      return value;
    }

    throw new GraphQLError(
      'GraphQL `Time` scalar parser expected a valid format `HH:mm`',
    );
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(
        `Time cannot represent non string type ${'value' in ast && ast.value}`,
        { nodes: ast },
      );
    }

    const value = ast.value;
    if (validateTime(value)) {
      return value;
    }

    throw new GraphQLError(
      'GraphQL `Time` scalar  Invalid time format. Use HH:mm',
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

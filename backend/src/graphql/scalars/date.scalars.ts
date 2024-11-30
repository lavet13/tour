import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

export const DateResolver = new GraphQLScalarType({
  name: 'Date',
  description: 'Custom `Date` scalar type supporting multiple input formats',
  serialize(value) {
    // Serialize to client: always return timestamp
    if (value instanceof Date) {
      return value.getTime();
    }
    throw new GraphQLError(
      'GraphQL `Date` scalar serializer expected a `Date` object',
    );
  },
  parseValue(value) {
    // Handle various input types from client
    if (typeof value === 'number') {
      return new Date(value);
    }

    if (typeof value === 'string') {
      // Try parsing ISO string, timestamp string, or other common date formats
      const parsedDate = new Date(value);

      // Validate that the parsed date is valid
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    throw new GraphQLError('GraphQL `Date` scalar parser expected a valid date input (number or string)');
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.INT:
        return new Date(parseInt(ast.value, 10));
      case Kind.STRING:
        const parsedDate = new Date(ast.value);
        return !isNaN(parsedDate.getTime()) ? parsedDate : null;
      default:
        return null;
    }
  },
});

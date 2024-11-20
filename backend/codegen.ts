import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/graphql/types',
  emitLegacyCommonJSImports: false,
  generates: {
    './src/graphql/__generated__/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '../../context#ContextValue',
      },
    },
  },

  config: {
    mappers: {
      User: '../../../node_modules/.prisma/client#User as UserModel',
      Booking: '../../../node_modules/.prisma/client#WbOrder as BookingModel',
      Role: '../../../node_modules/.prisma/client#Role as RoleModel',
    },
    inputMaybeValue: 'undefined | T',
  },

  watch: true,
};

export default config;

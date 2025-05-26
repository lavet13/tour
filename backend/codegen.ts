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
      TelegramChat:
        '../../../node_modules/.prisma/client#TelegramChat as TelegramChatModel',
      TelegramUser: '../../../node_modules/.prisma/client#TelegramUser as TelegramUserModel',
      Booking: '../../../node_modules/.prisma/client#Booking as BookingModel',
      City: '../../../node_modules/.prisma/client#City as CityModel',
      Route: '../../../node_modules/.prisma/client#Route as RouteModel',
      Region: '../../../node_modules/.prisma/client#Region as RegionModel',
      Schedule:
        '../../../node_modules/.prisma/client#Schedule as ScheduleModel',
      Role: '../../../node_modules/.prisma/client#Role as RoleModel',
    },
    inputMaybeValue: 'undefined | T',
  },

  watch: true,
};

export default config;

import { Resolvers } from '@/graphql/__generated__/types';

import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { GraphQLError } from 'graphql';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const resolvers: Resolvers = {
  Query: {
    async regions(_, __, ctx) {
      const regions = await ctx.prisma.region.findMany();

      return regions;
    },
    async regionByName(_, args, ctx) {
      const name = args.regionName;

      const region = await ctx.prisma.region
        .findUnique({
          where: {
            name,
          },
        })
        .catch((err: unknown) => {
          if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === 'P2025') {
              throw new GraphQLError(`Region with name \`${name}\` not found.`);
            }
          }
          console.log({ err });
          throw new GraphQLError('Unknown error!');
        });

      return region;
    },
    async regionForRoute(_, { departureCityId, arrivalCityId }, { prisma }) {
      const route = await prisma.route.findFirst({
        where: {
          departureCityId,
          arrivalCityId,
        },
        select: {
          region: true,
        },
      });

      console.log({ route });

      return route?.region ?? null;
    }
  },
  Region: {
    routes(parent, _, { loaders }) {
      return loaders.routesLoader.load(parent.id);
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {
};

export default composeResolvers(resolvers, resolversComposition);

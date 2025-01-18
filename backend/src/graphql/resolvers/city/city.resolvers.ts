import { Resolvers } from '@/graphql/__generated__/types';

import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { inspect } from 'util';

const resolvers: Resolvers = {
  Query: {
    async cities(_, __, ctx) {
      const cities = ctx.prisma.city.findMany();

      return cities;
    },
    async arrivalCities(_, { departureCityId }, { prisma }) {
      if (departureCityId === null) {
        return [];
      }

      const routes = await prisma.route.findMany({
        where: {
          departureCityId,
          OR: [{ departureDate: null }, { departureDate: { lte: new Date() } }],
          isActive: true,
        },
        select: {
          arrivalCity: true,
        },
        distinct: ['arrivalCityId'],
      });

      return routes.map(route => route.arrivalCity);
    },

    async departureCities(_, { regionId }, { prisma }) {
      const cities = await prisma.city.findMany({
        where: {
          departureTrips: {
            some: {
              region: {
                id: regionId ?? undefined,
              },
              OR: [
                {
                  departureDate: null,
                },
                { departureDate: { lte: new Date() } },
              ],
              isActive: true,
            },
          },
        },
        distinct: ['id'],
      });

      console.log(inspect(cities, { depth: Infinity, colors: true }));

      return cities;
    },
  },
  Mutation: {
    async createCity(_, { name }, ctx) {
      const city = await ctx.prisma.city.create({
        data: {
          name,
        },
      });

      return city;
    },
  },
  City: {
    async arrivalTrips(parent, _, { loaders }) {
      return loaders.arrivalTripsLoader.load(parent.id);
    },
    async departureTrips(parent, _, { loaders }) {
      return loaders.departureTripsLoader.load(parent.id);
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {};

export default composeResolvers(resolvers, resolversComposition);

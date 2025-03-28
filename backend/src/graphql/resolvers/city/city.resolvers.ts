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
    async arrivalCities(
      _,
      { cityId, includeInactiveCities = false },
      { prisma },
    ) {
      if (cityId === null) {
        return [];
      }

      // Get routes where the provided cityId is either the departure or arrival city
      const arrivalCitiesQuery = await prisma.route.findMany({
        where: {
          departureCityId: cityId,
          OR: [{ departureDate: null }, { departureDate: { lte: new Date() } }],
          ...(includeInactiveCities ? {} : { isActive: true }),
        },
        select: {
          arrivalCity: true,
        },
        distinct: ['arrivalCityId'],
      });

      const departureCitiesQuery = await prisma.route.findMany({
        where: {
          arrivalCityId: cityId,
          OR: [{ departureDate: null }, { departureDate: { lte: new Date() } }],
          ...(includeInactiveCities ? {} : { isActive: true }),
        },
        select: {
          departureCity: true,
        },
        distinct: ['departureCityId'],
      });

      // Process and combine results
      const arrivalCities = arrivalCitiesQuery
        .map(route => route.arrivalCity)
        .filter(Boolean);
      const departureCities = departureCitiesQuery
        .map(route => route.departureCity)
        .filter(Boolean);

      const citiesMap = new Map();

      [...arrivalCities, ...departureCities].forEach(city => {
        if (city?.id) {
          citiesMap.set(city.id, city);
        }
      });

      return Array.from(citiesMap.values());
    },
    async departureCities(_, { includeInactiveCities = false }, { prisma }) {
      // Find cities that are departure cities for the given region
      const departureCitiesQuery = await prisma.city.findMany({
        where: {
          departureTrips: {
            some: {
              OR: [
                { departureDate: null },
                { departureDate: { lte: new Date() } },
              ],
              ...(includeInactiveCities ? {} : { isActive: true }),
            },
          },
        },
        distinct: ['id'],
      });

      // Find cities that are arrival cities for the given region
      const arrivalCitiesQuery = await prisma.city.findMany({
        where: {
          arrivalTrips: {
            some: {
              OR: [
                { departureDate: null },
                { departureDate: { lte: new Date() } },
              ],
              ...(includeInactiveCities ? {} : { isActive: true }),
            },
          },
        },
        distinct: ['id'],
      });

      // Combine both sets of cities and remove duplicates
      const citiesMap = new Map();

      [...departureCitiesQuery, ...arrivalCitiesQuery].forEach(city => {
        if (city && city.id) {
          citiesMap.set(city.id, city);
        }
      });

      // Convert map values to array
      const cities = Array.from(citiesMap.values());

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

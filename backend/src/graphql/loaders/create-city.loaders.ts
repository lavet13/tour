import DataLoader from 'dataloader';
import prismaClient from '@/prisma';

export const createCityLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (cityIds: readonly string[]) => {
    const whereCondition = {
      id: { in: cityIds as string[] },
    };

    const cities = await prisma.city.findMany({ where: whereCondition });

    const cityMap = new Map(cities.map(city => [city.id, city]));

    return cityIds.map(id => cityMap.get(id) || null);
  });
};

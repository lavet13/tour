import DataLoader from 'dataloader';
import prismaClient from '@/prisma';

export const createCityLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (cityIds: readonly bigint[]) => {
    const cities = await prisma.city.findMany({
      where: {
        id: { in: cityIds as bigint[] },
      },
    });

    const cityMap = new Map(cities.map(city => [city.id, city]));

    return cityIds.map(id => cityMap.get(id) || null);
  });
};

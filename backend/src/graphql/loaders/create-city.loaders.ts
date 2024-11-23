import DataLoader from 'dataloader';
import prismaClient from '@/prisma';

export const createCityLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (cityIds: readonly (bigint | null)[]) => {
    const cities = await prisma.city.findMany({
      where: {
        id: { in: cityIds.filter(Boolean) as bigint[] },
      },
    });

    const cityMap = new Map(cities.map(city => [city.id, city]));

    return cityIds.map(id => id === null ? null : cityMap.get(id) || null);
  });
};

import DataLoader from 'dataloader';
import prismaClient from '@/prisma';

export const createCityLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (cityIds: readonly (string | null)[]) => {
    const cities = await prisma.city.findMany({
      where: {
        id: { in: cityIds.filter(Boolean) as string[] },
      },
    });

    const cityMap = new Map(cities.map(city => [city.id, city]));

    return cityIds.map(id => id === null ? null : cityMap.get(id) || null);
  });
};

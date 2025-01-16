import DataLoader from 'dataloader';
import prismaClient from '@/prisma';

export const createRegionLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (regionIds: readonly string[]) => {
    const regions = await prisma.region.findMany({
      where: {
        id: { in: regionIds as string[] },
      },
    });

    const regionMap = new Map(regions.map(region => [region.id, region]));

    return regionIds.map(id => regionMap.get(id) || null);
  });
};

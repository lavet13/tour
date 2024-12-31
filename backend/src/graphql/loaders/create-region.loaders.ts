import DataLoader from 'dataloader';
import prismaClient from '@/prisma';

export const createRegionLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (regionIds: readonly (string | null)[]) => {
    const nonNullRegionIds = regionIds.filter((id): id is string => id !== null);

    const regions = await prisma.region.findMany({
      where: {
        id: { in: nonNullRegionIds },
      },
    });

    const regionMap = new Map(regions.map(region => [region.id, region]));

    // Map back to original order, automatically handling nulls
    return regionIds.map(id => id === null ? null : regionMap.get(id) || null);
  });
};

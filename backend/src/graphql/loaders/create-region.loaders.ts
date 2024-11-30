import DataLoader from 'dataloader';
import prismaClient from '@/prisma';

export const createRegionLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (regionIds: readonly (string | null)[]) => {
    // This would error:
    // await prisma.region.findMany({ where: { id: { in: regionIds } } });
    // Because regionIds contains nulls which Prisma doesn't accept in 'in' clause

    // Filter out null IDs and query only for valid IDs
    const nonNullRegionIds = regionIds.filter((id): id is string => id !== null);

    // Fetch regions with their associated routes
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

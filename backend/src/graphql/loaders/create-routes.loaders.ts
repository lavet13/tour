import DataLoader from 'dataloader';
import prismaClient from '@/prisma';
import { Route } from '@prisma/client';

export const createRoutesLoader = (prisma: typeof prismaClient) => {
  return new DataLoader<bigint, Route[]>(async (regionIds: readonly bigint[]) => {
    // Fetch all routes for the provided route IDs
    const routes = await prisma.route.findMany({
      where: {
        regionId: { in: regionIds as bigint[] },
      },
    });

    // Group routes by regionId using a Map
    const routesMap = new Map<bigint, Route[]>();
    for (const route of routes) {
      if (!routesMap.has(route.regionId!)) {
        routesMap.set(route.regionId!, []);
      }
      routesMap.get(route.regionId!)?.push(route);
    }

    // Map regionIds to their corresponding routes (or an empty array if none exist)
    return regionIds.map((regionId) => routesMap.get(regionId) || []);
  });
};

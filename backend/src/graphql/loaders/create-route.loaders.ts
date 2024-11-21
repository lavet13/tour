import DataLoader from 'dataloader';
import prismaClient from '@/prisma';

export const createRouteLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (routeIds: readonly bigint[]) => {
    const routes = await prisma.route.findMany({
      where: {
        id: { in: routeIds as bigint[] },
      },
    });

    const routeMap = new Map(routes.map(route => [route.id, route]));

    return routeIds.map(id => routeMap.get(id) || null);
  });
};

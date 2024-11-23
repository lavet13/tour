import DataLoader from 'dataloader';
import prismaClient from '@/prisma';

export const createRouteLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (routeIds: readonly (bigint | null)[]) => {
    // Filter out null IDs and query only for valid IDs
    const nonNullRouteIds = routeIds.filter((id): id is bigint => id !== null);

    // Fetch routes from the database
    const routes = await prisma.route.findMany({
      where: { id: { in: nonNullRouteIds } },
    });

    // Create a map of routes by ID
    const routeMap = new Map(
      routes.map((route) => [route.id, route])
    );

    // Return the result for each ID in the same order
    return routeIds.map((id) => (id === null ? null : routeMap.get(id) || null));
  });
};

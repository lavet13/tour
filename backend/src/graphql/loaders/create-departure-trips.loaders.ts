import DataLoader from 'dataloader';
import prismaClient from '@/prisma';

export const createDepartureTripsLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (cityIds: readonly bigint[]) => {
    const routes = await prisma.route.findMany({
      where: {
        departureCityId: { in: cityIds as bigint[] },
      },
    });

    // Transform routes to include isAvailable
    const transformedRoutes = routes.map(route => ({
      ...route,
      isAvailable: route.departureDate
        ? new Date(route.departureDate) >= new Date()
        : null,
    }));

    const routesByCityId = new Map<bigint, (typeof transformedRoutes)[0][]>(
      cityIds.map(id => [id, []]),
    );

    transformedRoutes.forEach(route => {
      if (routesByCityId.has(route.departureCityId!)) {
        routesByCityId.get(route.departureCityId!)!.push(route);
      }
    });

    return cityIds.map(id => routesByCityId.get(id) || []);
  });
};

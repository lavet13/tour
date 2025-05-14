import DataLoader from 'dataloader';
import prismaClient from '@/prisma';
import { Schedule } from '@prisma/client';

export const createSchedulesLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (routeIds: readonly string[]) => {
    // Fetch all schedules for the provided route IDs
    const schedules = await prisma.schedule.findMany({
      where: {
        routeId: { in: routeIds as string[] },
      },
    });

    // Group schedules by routeId using a Map
    const schedulesMap = new Map<string, Schedule[]>();
    for (const schedule of schedules) {
      if (!schedulesMap.has(schedule.routeId)) {
        schedulesMap.set(schedule.routeId, []);
      }
      schedulesMap.get(schedule.routeId)?.push(schedule);
    }

    // Map routeIds to their corresponding schedules (or an empty array if none exist)
    return routeIds.map((routeId) => schedulesMap.get(routeId) || []);
  });
};

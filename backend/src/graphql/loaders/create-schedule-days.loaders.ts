import DataLoader from 'dataloader';
import prismaClient from '@/prisma';
import { ScheduleDays } from '@prisma/client';

export const createScheduleDaysLoader = (prisma: typeof prismaClient) => {
  return new DataLoader<string, ScheduleDays[]>(async (scheduleIds: readonly string[]) => {
    // Fetch all scheduleDays for the provided schedule IDs
    const scheduleDays = await prisma.scheduleDays.findMany({
      where: {
        scheduleId: { in: scheduleIds as string[] },
      },
    });

    // Group scheduleDays by scheduleId using a Map
    const scheduleDaysMap = new Map<string, ScheduleDays[]>();
    for (const scheduleDay of scheduleDays) {
      if (!scheduleDaysMap.has(scheduleDay.scheduleId!)) {
        scheduleDaysMap.set(scheduleDay.scheduleId!, []);
      }
      scheduleDaysMap.get(scheduleDay.scheduleId!)?.push(scheduleDay);
    }

    // Map scheduleIds to their corresponding scheduleDays (or an empty array if no scheduleDays exist)
    return scheduleIds.map((routeId) => scheduleDaysMap.get(routeId) || []);
  });
};

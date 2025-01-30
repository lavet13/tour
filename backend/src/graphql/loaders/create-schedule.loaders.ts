import DataLoader from 'dataloader';
import prismaClient from '@/prisma';

export const createScheduleLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (scheduleIds: readonly (string | null)[]) => {
    // Filter out null IDs and query only for valid IDs
    const nonNullRouteIds = scheduleIds.filter((id): id is string => id !== null);

    // Fetch schedules from the database
    const schedules = await prisma.schedule.findMany({
      where: { id: { in: nonNullRouteIds } },
    });

    // Create a map of schedules by ID
    const scheduleMap = new Map(
      schedules.map((route) => [route.id, route])
    );

    // Return the result for each ID in the same order
    return scheduleIds.map((id) => (id === null ? null : scheduleMap.get(id) || null));
  });
};

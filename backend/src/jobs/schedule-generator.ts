import prismaClient from '@/prisma';
import { DaysOfWeek, Prisma } from '@prisma/client';
import { addDays } from 'date-fns';

export async function generateSchedulesForNextWeek(
  prisma: typeof prismaClient,
) {
  const activeSchedules = await prisma.schedule.findMany({
    where: { isActive: true },
  });

  if(!activeSchedules.length) {
    console.log('No active schedules to process.');
    return 0;
  }

  const scheduleMap = activeSchedules.reduce(
    (map, schedule) => {
      const { routeId, dayOfWeek } = schedule;

      if (!map[routeId]) {
        map[routeId] = [];
      }

      map[routeId].push(dayOfWeek);
      return map;
    },
    {} as Record<string, DaysOfWeek[]>,
  );

  const schedulesToCreate: Prisma.ScheduleCreateInput[] = [];

  for (const schedule of activeSchedules) {
    const { routeId, travelDate, dayOfWeek } = schedule;

    const daysForRoute = scheduleMap[routeId] || [];
    if (daysForRoute.filter(day => day === dayOfWeek).length > 1) {
      console.log(
        `Skipping route ${routeId}: duplicate schedules for day ${dayOfWeek}.`,
      );
      continue;
    }

    // Calculate next week's travel date
    const nextTravelDate = addDays(new Date(travelDate), 7);

    schedulesToCreate.push({
      route: {
        connect: {
          id: routeId,
        },
      },
      dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      seatsAvailable: schedule.seatsAvailable,
      travelDate: nextTravelDate,
      price: schedule.price,
      isActive: true,
      seatsBooked: 0,
    });
  }

  try {
    const result = await prisma.$transaction(
      schedulesToCreate.map(data => prisma.schedule.create({ data })),
    );
    console.log(`✔ Successfully created ${result.length} schedules.`);
    return result.length;
  } catch (error) {
    console.error('Error during batch schedule creation: ', error);
    return 0;
  }
}

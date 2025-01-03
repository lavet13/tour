import cron from 'node-cron';
import { generateSchedulesForNextWeek } from '@/jobs/schedule-generator';
import prisma from '@/prisma';

console.log('Cron job setup started.');

cron.schedule('59 23 * * *', async () => {
  console.log('Cron job started: Generating schedules for next week.');
  try {
    await generateSchedulesForNextWeek(prisma);
  } catch (error) {
    console.error('Error during schedule generation:', error);
  }
});

console.log('Cron job setup completed.');

import { handlers } from '@/services/telegram/features/bookings/handlers';
import { BotFeature } from '@/services/telegram/telegram-bot.types';

export const bookingsFeature: BotFeature = {
  callbackHandlers: [
    {
      canHandle: data =>
        data.startsWith('booking:status_'),
      handle: handlers.bookingStatusChange,
    },
  ],
};

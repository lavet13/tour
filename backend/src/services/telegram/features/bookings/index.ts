import { BotFeature } from '@/services/telegram/telegram-bot.types';
import { handlers } from '@/services/telegram/features/bookings/handlers';

export const bookingsFeature: BotFeature = {
  name: 'bookings',

  callbackHandlers: [
    {
      canHandle: data =>
        data.startsWith('booking:confirm_') ||
        data.startsWith('booking:pending_'),
      handle: handlers.bookingStatusChange,
    },
  ],
};

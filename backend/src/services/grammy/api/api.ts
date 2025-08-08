import { BotError, Composer } from 'grammy';
import { handleBookingSendMessage, handleBookingStatus } from '@/services/grammy/api/bookings/middlewares';
import { CustomContext } from '@/services/grammy/types';

const api = new Composer();

api
  .errorBoundary((error: BotError<CustomContext>) => {
    console.error('Error in booking API:', error);
  })
  .callbackQuery(/booking:status_(.*)/, handleBookingStatus)
  .callbackQuery(/booking:send-message_(.*)/, handleBookingSendMessage);

export { api };

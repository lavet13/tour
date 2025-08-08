import { BotError, Composer } from 'grammy';
import {
  handleBookingSendMessage,
  handleBookingStatus,
} from '@/services/grammy/api/bookings/middlewares';
import { CustomContext } from '@/services/grammy/types';

const api = new Composer();

api
  .errorBoundary((error: BotError<CustomContext>) => {
    console.error('Error in booking API:', error);
  })
  .callbackQuery(/booking:send-message_(.*)/, handleBookingSendMessage)
  .callbackQuery(/booking:status_(.*)/, handleBookingStatus);

export { api };

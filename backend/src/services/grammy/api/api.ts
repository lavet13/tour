import { BotError, Composer } from 'grammy';
import {
  handleBookingSendMessage,
  handleBookingSendNoAvailabilityMessage,
  handleBookingStatus,
} from '@/services/grammy/api/bookings/middlewares';
import { CustomContext } from '@/services/grammy/types';

const api = new Composer().errorBoundary((error: BotError<CustomContext>) => {
  console.error('Error in booking API:', error);
});

api.callbackQuery(/booking:status_(.*)/, handleBookingStatus);

api.callbackQuery(/booking:send-message_(.*)/, handleBookingSendMessage);

api.callbackQuery(
  /booking:send-no-availability_(.*)/,
  handleBookingSendNoAvailabilityMessage,
);

export { api };

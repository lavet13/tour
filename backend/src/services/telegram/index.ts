import { getBotState } from '.';
import { actions } from '@/services/telegram/features/bookings/actions';

export * from './telegram-bot.config';
export * from './telegram-bot.core';
export * from './telegram-bot.types';

/*
 * Creates the bot service singleton
 * @returns TelegramBotState object
 */
const createBotService = () => {
  getBotState();

  return {
    notifyNewBooking: actions.notifyNewBooking,
  };
};

// Create the singleton service instance
const telegramBotService = createBotService();

export const getTelegramBot = () => telegramBotService;

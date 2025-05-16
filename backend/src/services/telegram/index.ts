import { getBotState } from '@/services/telegram';
import { getPublicAPIs } from '@/services/telegram/features';

export * from './telegram-bot.config';
export * from './telegram-bot.core';
export * from './telegram-bot.types';

/*
 * Creates the bot service singleton
 * @returns TelegramBotState object
 */
const createBotService = () => {
  return {
    ...getBotState(),
    ...getPublicAPIs(),
  };
};

// Create the singleton service instance
const telegramBotService = createBotService();

export const getTelegramBot = () => telegramBotService;

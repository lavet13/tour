import { getBotState } from '@/services/telegram/telegram-bot.core';
import {
  sendTelegramMessage,
  notifyNewBooking,
} from '@/services/telegram/telegram-bot.helpers';

/*
 * Creates the bot service singleton
 * @returns TelegramBotState object
 */
const createBotService = () => {
  // Initialize the bot state (only happens once)
  getBotState();

  // Return the service object with methods
  return {
    sendTelegramMessage,
    notifyNewBooking,
  };
};

// Create the singleton service instance
const telegramBotService = createBotService();

/*
 * Returns the Telegram bot service state
 * @returns TelegramBotState object
 */
export const getTelegramBot = () => telegramBotService;

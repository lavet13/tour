import { getBotState } from '@/services/telegram/telegram-bot.core';
import { sendMessage } from '@/services/telegram/services/message.service';
import {
  bookingsFeature,
  contactsFeature,
  appFeature,
} from '@/services/telegram/features';

/*
 * Creates the bot service singleton
 * @returns TelegramBotState object
 */
const createBotService = () => {
  // Initialize the bot state (only happens once)
  getBotState();

  // Return the service object with methods
  return {};
};

// Create the singleton service instance
const telegramBotService = createBotService();

/*
 * Returns the Telegram bot service state
 * @returns TelegramBotState object
 */
export const getTelegramBot = () => telegramBotService;

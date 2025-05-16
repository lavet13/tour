import TelegramBot from 'node-telegram-bot-api';
import {
  TelegramAPIError,
  TelegramFatalError,
  TelegramParseError,
  isErrorWithCode,
  isErrorWithResponse,
  TelegramBotConfig,
  TelegramBotError,
  TelegramBotState,
  BotFeature,
} from '@/services/telegram/telegram-bot.types';
import { config } from '@/services/telegram/telegram-bot.config';
import {
  handleBookingStatusChange,
  sendTelegramMessage,
} from '@/services/telegram/telegram-bot.helpers';
import { BookingStatus } from '@/graphql/__generated__/types';
import { registerFeatures } from './features';

// Private singleton instance
let botStateInstance: TelegramBotState | null = null;

/**
 * Creates a Telegram bot instance
 * @param config Bot configuration
 * @returns TelegramBot instance or null if disabled/failed
 */
const createBot = (config: TelegramBotConfig): TelegramBot | null => {
  if (!config.enabled || !config.botToken) {
    console.log('Telegram bot is disabled or missing token');
    return null;
  }

  try {
    const bot = new TelegramBot(config.botToken, { polling: true });
    console.log('Telegram bot initialized successfully');

    bot.on('polling_error', (error: Error) => {
      console.error(
        `Polling error:`,
        error instanceof Error ? error.message : String(error),
      );
      handleTelegramError(error);
    });

    return bot;
  } catch (error) {
    console.error('Failed to initialize Telegram bot: ', error);
    return null;
  }
};

/**
 * Sets up bot commands with descriptions that appear in the menu
 * @param bot TelegramBot instance
 */
const setupBotCommands = async (
  bot: TelegramBot | null,
  features: BotFeature[],
): Promise<TelegramBot | void> => {
  if (!bot) return;

  try {
    const commands = features.reduce((allCommands, feature) => {
      if (feature.commands) {
        return [...allCommands, ...feature.commands];
      }

      return allCommands;
    }, [] as TelegramBot.BotCommand[]);

    await bot.setMyCommands(commands);
    console.log('Bot commands set successfully');
  } catch (error) {
    console.error('Failed to set bot commands:', error);
    handleTelegramError(error);
  }

  return bot;
};

/**
 * Sets up command handlers for the bot
 * @param bot TelegramBot instance
 * @returns The same bot instance or null
 */
const setupCommandHandlers = (
  bot: TelegramBot | null,
  features: BotFeature[],
): TelegramBot | void => {
  if (!bot) return;

  features.forEach(feature => {
    if (feature.commandHandlers) {
      feature.commandHandlers.forEach(handler => {
        bot.onText(handler.regex, handler.handler);
      });
    }
  });

  bot.on('callback_query', async query => {
    if (!query.message || !query.data) return;

    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    try {
      // Answer the callback query to remove the loading state
      await bot.answerCallbackQuery(query.id);

      let handled = false;

      for (const feature of features) {
        if (feature.callbackHandlers) {
          for (const handler of feature.callbackHandlers) {
            if (handler.canHandle(data)) {
              await handler.handle(bot, chatId, messageId, data, query);
              handled = true;
              break;
            }
          }
          if (handled) break;
        }
      }

      if (!handled) {
        console.warn(`No handler found for callback data: ${data}`);
        await bot.sendMessage(chatId, 'Unknown command');
      }
    } catch (error) {
      console.error('Error handling callback query:', error);
      handleTelegramError(error);
    }
  });

  return bot;
};

/**
 * Initializes the bot state
 * @param config Bot configuration
 * @returns TelegramBotState object
 */
const initializeBotState = (config: TelegramBotConfig): TelegramBotState => {
  const bot = createBot(config);
  const features = registerFeatures();

  if (bot) {
    setupBotCommands(bot, features);
    setupCommandHandlers(bot, features);
  }

  return {
    bot,
    features,
    config,
  };
};

/**
 * Gets the bot state or initializes it if it doesn't exist
 * @returns TelegramBotState object
 */
export const getBotState = (): TelegramBotState => {
  if (!botStateInstance) {
    botStateInstance = initializeBotState(config);
  }
  return botStateInstance;
};

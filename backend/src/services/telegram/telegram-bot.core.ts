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
} from '@/services/telegram/telegram-bot.types';
import { config } from '@/services/telegram/telegram-bot.config';

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

      // Type guard for checking if the error has the expected structure
      if (isErrorWithCode(error)) {
        console.error(`Error code: ${error.code}`);
      }

      if (isErrorWithResponse(error)) {
        console.error('Error details:', error.response.body);
      }
    });

    return bot;
  } catch (error) {
    console.error('Failed to initialize Telegram bot: ', error);
    return null;
  }
};

/**
 * Sets up command handlers for the bot
 * @param bot TelegramBot instance
 * @returns The same bot instance or null
 */
const setupCommandHandlers = (bot: TelegramBot | null): TelegramBot | void => {
  if (!bot) return;

  bot.onText(/\/start/, async msg => {
    const chatId = msg.chat.id;
    try {
      await bot.sendMessage(
        chatId,
        `Приветствую, скопируй и перекинь ID: \`\`\`${chatId}\`\`\`\[Ванечке](https://t.me/opezdal1488228)`,
        {
          parse_mode: 'MarkdownV2',
        },
      );
    } catch (error) {
      console.error(`Failed to send message to ${chatId}`);

      handleTelegramError(error);
    }
  });

  return bot;
};

/**
 * Sets up bot commands with descriptions that appear in the menu
 * @param bot TelegramBot instance
 */
const setupBotCommands = async (
  bot: TelegramBot | null,
): Promise<TelegramBot | void> => {
  if (!bot) return;

  try {
    await bot.setMyCommands([
      { command: 'start', description: 'Начать разговор с ботом' },
    ]);
    console.log('Bot commands set successfully');
  } catch (error) {
    console.error('Failed to set bot commands:', error);
    handleTelegramError(error);
  }

  return bot;
};

/**
 * Initializes the bot state
 * @param config Bot configuration
 * @returns TelegramBotState object
 */
const initializeBotState = (config: TelegramBotConfig): TelegramBotState => {
  const bot = createBot(config);

  if (bot) {
    setupBotCommands(bot);
    setupCommandHandlers(bot);
  }

  return {
    bot,
    config,
  };
};

/**
 * Gets the bot state or initializes it if it doesn't exist
 * @returns TelegramBotState object
 */
export const getBotState = (): TelegramBotState => {
  if (!botStateInstance) {
    botStateInstance = initializeBotState({
      botToken: config.botToken,
      managerChatIds: config.managerChatIds,
      enabled: config.enabled,
    });
  }
  return botStateInstance;
};

export const handleTelegramError = (error: unknown): void => {
  if (error instanceof TelegramFatalError) {
    console.error('Фатальная ошибка:', error.message);
  } else if (error instanceof TelegramParseError) {
    console.error('Ошибка парсинга:', error.message, error.response?.body);
  } else if (error instanceof TelegramAPIError) {
    console.error('Ошибка Telegram API:', error.response?.body);
  } else if (error instanceof TelegramBotError) {
    console.error(`Telegram ошибка (${error.code}):`, error.message);
  } else {
    console.error('Неизвестная ошибка:', error);
  }
};

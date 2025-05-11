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
import { sendTelegramMessage } from '@/services/telegram/telegram-bot.helpers';

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
    await showMainMenu(chatId);
  });

  bot.onText(/\/app/, async msg => {
    const chatId = msg.chat.id;
    await showMiniApp(chatId);
  });

  bot.on('callback_query', async query => {
    if (!query.message) return;

    const chatId = query.message.chat.id;
    const data = query.data;

    try {
      // Answer the callback query to remove the loading state
      await bot.answerCallbackQuery(query.id);

      // Process different callback data
      switch (data) {
        case 'show_contacts':
          await bot.sendMessage(
            chatId,
            `
Наши контакты:\n
📞 Феникс: +79493180304
📞 Феникс: +79494395616
📩 Whatsapp: <a href="https://wa.me/+380713180304">+380713180304</a>
📩 Telegram: <a href="https://t.me/+79493180304">+79493180304</a>
`,
            {
              parse_mode: 'HTML',
            },
          );
          break;
        default:
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
      { command: 'app', description: 'Открыть мини-приложение' },
    ]);
    console.log('Bot commands set successfully');
  } catch (error) {
    console.error('Failed to set bot commands:', error);
    handleTelegramError(error);
  }

  return bot;
};

/**
 * Shows the main menu with inline buttons
 * @param chatId Chat ID to send the menu to
 */
async function showMainMenu(chatId: number | string): Promise<void> {
  try {
    await sendTelegramMessage(chatId, 'Давайте приступим!\n', {
      reply_markup: {
        resize_keyboard: true,
        inline_keyboard: [
          [{ text: '📞 Контакты', callback_data: 'show_contacts' }],
          [
            {
              text: 'Открыть приложение',
              web_app: {
                url: import.meta.env.VITE_TELEGRAM_MINI_APP_URL,
              },
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error(`Failed to show main menu to ${chatId}`, error);
    handleTelegramError(error);
  }
}

async function showMiniApp(chatId: number): Promise<void> {
  try {
    await sendTelegramMessage(
      chatId,
      '📱 Откройте наше приложение для более удобного бронирования:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Открыть приложение',
                web_app: {
                  url: import.meta.env.VITE_TELEGRAM_MINI_APP_URL,
                },
              },
            ],
          ],
        },
      },
    );
  } catch (error) {
    console.error(`Failed to show mini app button to ${chatId}:`, error);
    handleTelegramError(error);
  }
}

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

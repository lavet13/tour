import {
  TelegramBotError,
  TelegramFatalError,
  TelegramParseError,
  TelegramAPIError,
} from '@/services/telegram/telegram-bot.types';

/**
 * Handles Telegram errors with type checking and logging
 * @param error The error to handle
 */
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

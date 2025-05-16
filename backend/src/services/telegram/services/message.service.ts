import TelegramBot from 'node-telegram-bot-api';
import { getBotState } from '@/services/telegram/telegram-bot.core';
import { handleTelegramError } from '@/services/telegram/services/error.service';

/**
 * Helper function to send a message with error handling
 * @param chatId Target chat ID
 * @param text Message text
 * @param options Message options
 * @returns Promise that resolves with the message or rejects with an error
 */
export const sendMessage = async (
  chatId: number | string,
  text: string,
  options?: TelegramBot.SendMessageOptions,
): Promise<TelegramBot.Message | null> => {
  const { bot } = getBotState();

  if (!bot) {
    console.error('Cannot send message: Telegram bot is not initialized');
    return null;
  }

  try {
    return await bot.sendMessage(chatId, text, options);
  } catch (error: unknown) {
    console.error(`Failed to send message to ${chatId}:`, error);

    handleTelegramError(error);

    return null;
  }
};

/**
 * Creates main menu keyboard
 * @returns Inline keyboard markup for main menu
 */
export const getMainMenuKeyboard = () => {
  const { config } = getBotState();

  return {
    resize_keyboard: true,
    inline_keyboard: [
      [
        { text: '📞 Контакты', callback_data: 'contacts:show' },
        {
          text: 'Открыть приложение',
          web_app: {
            url: config.miniAppUrl,
          },
        },
      ],
    ],
  };
};

/**
 * Shows the main menu with inline buttons
 * @param chatId Chat ID to send the menu to
 */
export async function showMainMenu(chatId: number | string): Promise<void> {
  try {
    await sendMessage(chatId, 'Давайте приступим!\n', {
      reply_markup: getMainMenuKeyboard(),
    });
  } catch (error) {
    console.error(`Failed to show main menu to ${chatId}`, error);
    handleTelegramError(error);
  }
}

import { BotFeature } from '@/services/telegram/telegram-bot.types';
import { showMainMenu } from '@/services/telegram/services/message.service';
import { handleTelegramError } from '@/services/telegram/services/error.service';

export const mainMenuFeature: BotFeature = {
  commands: [{ command: 'start', description: 'Начать разговор с ботом' }],

  commandHandlers: [
    {
      regex: /\/start/,
      handler: async msg => {
        const chatId = msg.chat.id;
        await showMainMenu(chatId);
      },
    },
  ],

  callbackHandlers: [
    {
      canHandle: (data: string) => data === 'back_to_main',
      handle: async (bot, chatId, messageId, _data) => {
        try {
          await bot.editMessageText('Главное меню\n', {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [{ text: '☎  Контакты', callback_data: 'contacts:show' }],
                [
                  {
                    text: '📲 Открыть приложение',
                    web_app: {
                      url: import.meta.env.VITE_TELEGRAM_MINI_APP_URL,
                    },
                  },
                ],
              ],
            },
          });
        } catch (error) {
          console.error('Failed to edit main menu:', error);
          handleTelegramError(error);
        }
      },
    },
  ],
};

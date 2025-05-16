import { BotFeature } from '@/services/telegram/telegram-bot.types';
import { sendMessage } from '@/services/telegram/services/message.service';
import { getBotState } from '@/services/telegram/telegram-bot.core';
import { handleTelegramError } from '@/services/telegram/services/error.service';

/**
 * Shows the mini app button
 * @param chatId Chat ID to send to
 */
export async function showMiniApp(chatId: number): Promise<void> {
  const { config } = getBotState();

  try {
    await sendMessage(
      chatId,
      '📱 Откройте наше приложение для заказа билета:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Открыть приложение',
                web_app: {
                  url: config.miniAppUrl,
                },
              },
            ],
          ],
        },
      },
    );
  } catch (error) {
    console.error(`Failed to show mini app button to ${chatId}:`, error);
    throw error;
  }
}

export const appFeature: BotFeature = {
  commands: [
    { command: 'app', description: 'Открыть мини-приложение' },
    {
      command: 'mychatid',
      description: 'Показать ваш Chat ID для связки аккаунта',
    },
  ],

  commandHandlers: [
    {
      regex: /\/app/,
      handler: async msg => {
        const chatId = msg.chat.id;
        await showMiniApp(chatId);
      },
    },
    {
      regex: /\/mychatid/,
      handler: async msg => {
        try {
          const chatId = msg.chat.id;
          await sendMessage(
            chatId,
            `Ваш Телеграмм Chat ID: <code>${chatId}</code>\n\nИспользуйте его для привязки с вашим аккаунтом в веб-приложении.\n\n<strong><em>Только для администраторов</em></strong>`,
            { parse_mode: 'HTML' },
          );
        } catch (error) {
          console.error('Failed to show Chat ID:', error);
          handleTelegramError(error);
        }
      },
    },
  ],
};

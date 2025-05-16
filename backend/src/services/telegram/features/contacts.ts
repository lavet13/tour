import { BotFeature } from '@/services/telegram/telegram-bot.types';
import { handleTelegramError } from '@/services/telegram/services/error.service';

export const contactsFeature: BotFeature = {
  name: 'contacts',

  callbackHandlers: [
    {
      canHandle: data => data === 'contacts:show',
      handle: async (bot, chatId, messageId) => {
        try {
          await bot.editMessageText(
            `
<b>Наши контакты</b>

📞 Феникс: +79493180304
📞 Феникс: +79494395616
📩 Whatsapp: <a href="https://wa.me/+380713180304">+380713180304</a>
📩 Telegram: <a href="https://t.me/+79493180304">+79493180304</a>
Мы ВКонтакте:
vk.com/go_to_krym
Присоединяйтесь к нашему телеграмм каналу:
t.me/Donbass_Tur
Наш сайт:
donbass-tour.online
`,
            {
              chat_id: chatId,
              message_id: messageId,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: 'Назад', callback_data: 'back_to_main' }],
                ],
              },
            },
          );
        } catch (error) {
          console.error('Error showing contacts:', error);
          handleTelegramError(error);
        }
      },
    },
  ],
};

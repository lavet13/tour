import { Command } from '@grammyjs/commands';
import { InlineKeyboard } from 'grammy';
import { CustomContext } from '../..';

const appInlineKeyboard = new InlineKeyboard().webApp(
  'Открыть приложение',
  import.meta.env.VITE_TELEGRAM_MINI_APP_URL,
);

export default new Command<CustomContext>(
  'app',
  'Открыть мини-приложение в Телеграме',
  ctx =>
    ctx.reply('📱 Откройте наше приложение для заказа билета:', {
      reply_markup: appInlineKeyboard,
    }),
);

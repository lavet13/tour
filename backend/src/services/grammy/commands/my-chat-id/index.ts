import { Command } from '@grammyjs/commands';
import { CustomContext } from '../..';

export default new Command<CustomContext>(
  'mychatid',
  'Показать ваш Chat ID для связки аккаунта..',
  async ctx => {
    await ctx.reply(
      `Ваш Телеграмм Chat ID: <code>${ctx.chatId}</code>\n\nИспользуйте его для привязки с вашим аккаунтом в веб-приложении.\n\n<strong><em>Только для администраторов</em></strong>`,
      { parse_mode: 'HTML' },
    );
  },
);

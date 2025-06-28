import { Command } from '@grammyjs/commands';

import { startMenu } from '@/services/grammy/commands/start/menu';
import { CustomContext } from '../..';

export default new Command<CustomContext>(
  'start',
  'Начать разговор с ботом',
  async ctx => {
    await ctx.reply('🏡 Главное меню', { reply_markup: startMenu });
  },
);

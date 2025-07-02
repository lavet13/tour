import { Command } from '@grammyjs/commands';

import { CustomContext } from '../..';
import { startMenu } from '@/services/grammy/commands/start/menu';

export default new Command<CustomContext>(
  'start',
  'Начать разговор с ботом',
  async ctx => {
    await ctx.reply('🏡 Главное меню', { reply_markup: startMenu });
  },
);

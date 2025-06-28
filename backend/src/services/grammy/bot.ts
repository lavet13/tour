import { commands } from '@/services/grammy/commands';
import { mainMenu } from '@/services/grammy/commands/main-menu';
import { CustomContext, createEnhancedBot } from '@/services/grammy/types';
import { api } from '@/services/grammy/api';
import { BotError, GrammyError, HttpError } from 'grammy';
import { formatRussianDateTime } from '@/helpers/format-russian-date';

const bot = createEnhancedBot(import.meta.env.VITE_TELEGRAM_BOT_TOKEN);

bot
  .errorBoundary((error: BotError<CustomContext>) => {
    console.error(
      'Failed action at main-menu:',
      error,
      formatRussianDateTime(new Date()),
    );
  })
  .use(mainMenu);

bot
  .errorBoundary((error: BotError<CustomContext>) => {
    console.error(
      'Error in commands:',
      error,
      formatRussianDateTime(new Date()),
    );
  })
  .use(commands);

try {
  await commands.setCommands(bot)
  console.log('Bot commands set successfully.');
} catch (error) {
  console.error('Failed to set bot commands:', error);
}

bot
  .errorBoundary((error: BotError<CustomContext>) => {
    console.error(
      'Error in API call:',
      error,
      formatRussianDateTime(new Date()),
    );
  })
  .use(api);

bot.on('callback_query:data', async ctx => {
  const payload = ctx.callbackQuery.data;
  console.log('Unknown button event with payload', {
    payload,
    timestamp: formatRussianDateTime(new Date()),
  });
  await ctx.answerCallbackQuery({
    text: 'Неизвестное действие.',
  });
});


export { bot };

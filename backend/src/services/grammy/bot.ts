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

try {
  await commands.setCommands(bot);
  console.log('Bot commands set successfully.');
} catch (error) {
  console.error('Failed to set bot commands:', error);
}

bot.catch(err => {
  const ctx = err.ctx;

  console.error(`Error while handling update ${ctx.update.update_id}:`);

  const e = err.error;
  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }
});

// do not await start method, because it's infinite, unless stopped
bot.start();
console.log('Telegram bot started');

export { bot };

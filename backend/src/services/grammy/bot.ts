import { commands } from '@/services/grammy/commands';
import { mainMenu } from '@/services/grammy/commands/main-menu';
import { createEnhancedBot } from '@/services/grammy/types';
import { api } from '@/services/grammy/api';
import { GrammyError, HttpError } from 'grammy';
import { formatRussianDateTime } from '@/helpers/format-russian-date';
import { handleBookingSendMessage } from './api/bookings';

const bot = createEnhancedBot(import.meta.env.VITE_TELEGRAM_BOT_TOKEN);

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

bot.use(mainMenu);
bot.use(commands);
bot.use(api);

try {
  await commands.setCommands(bot, {
    ignoreUncompliantCommands: true,
  });
  console.log('Bot commands set successfully');
} catch (error) {
  console.error('Failed setting up commands for user:', error);
}

bot.on('callback_query:data', async ctx => {
  const payload = ctx.callbackQuery.data;
  console.log('Unknown button event with payload', {
    payload,
    timestamp: formatRussianDateTime(new Date()),
  });
  await ctx.answerCallbackQuery({
    text: 'Необработанное действие 😥',
  });
});

// do not await start method, because it's infinite, unless stopped
bot.start();
console.log('Telegram bot started');

export { bot };

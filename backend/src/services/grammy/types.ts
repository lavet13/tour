import { Bot, Context } from 'grammy';
import {
  NotifyNewBookingType,
  notifyNewBooking,
} from '@/services/grammy/api/bookings';
import {
  NotifyNewFeedbackType,
  notifyNewFeedback,
} from '@/services/grammy/api/feedback';

export type CustomContext = Context;

export type TCustomBot = Bot<CustomContext> & {
  notifyNewBooking: NotifyNewBookingType;
  notifyNewFeedback: NotifyNewFeedbackType;
};

export function createEnhancedBot(token: string): TCustomBot {
  const bot = new Bot(token) as TCustomBot;

  bot.notifyNewBooking = notifyNewBooking(bot);
  bot.notifyNewFeedback = notifyNewFeedback(bot);

  return bot;
}

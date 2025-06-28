import prisma from '@/prisma';
import { Role } from '@prisma/client';
import { TCustomBot } from '@/services/grammy';
import {
  getInlineKeyboardForBookings,
  formatBookingMessage,
} from './formatters';
import { NotifyNewBookingType } from './types';

export const notifyNewBooking: (bot: TCustomBot) => NotifyNewBookingType =
  (bot: TCustomBot) => async booking => {
    try {
      const message = await formatBookingMessage(booking);

      const chatIds = await prisma.telegramChat.findMany({
        distinct: 'chatId',
        select: {
          chatId: true,
        },
        where: {
          user: {
            roles: {
              some: {
                role: { in: [Role.ADMIN, Role.MANAGER] },
              },
            },
          },
        },
      });

      await Promise.all(
        chatIds.map(({ chatId }) =>
          bot.api.sendMessage(chatId.toString(), message, {
            parse_mode: 'HTML',
            reply_markup: getInlineKeyboardForBookings(
              booking.id,
              booking.status,
            ),
          }),
        ),
      );
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      throw error;
    }
  };

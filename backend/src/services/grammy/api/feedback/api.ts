import { Feedback, Role } from '@prisma/client';
import { TCustomBot } from '@/services/grammy/types';
import {
  NotifyNewFeedbackType,
  formatFeedbackMessage,
} from '@/services/grammy/api/feedback';
import prisma from '@/prisma';

export const notifyNewFeedback: (bot: TCustomBot) => NotifyNewFeedbackType =
  bot => async (feedback: Feedback) => {
    try {
      const message = formatFeedbackMessage(feedback);

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
          }),
        ),
      );
    } catch (error) {
      console.error('Failed to send feedback:', error);
      throw error;
    }
  };

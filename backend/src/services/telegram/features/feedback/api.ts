import prisma from '@/prisma';
import { Feedback, Role } from '@prisma/client';
import { handleTelegramError } from '@/services/telegram/services/error.service';
import { formatters } from '@/services/telegram/features/feedback/formatters';
import { sendMessage } from '@/services/telegram/services/message.service';

const notifyNewFeedback = async (
  feedback: Feedback,
  prismaClient: typeof prisma = prisma,
): Promise<void> => {
  try {
    const message = formatters.formatFeedbackMessage(feedback);

    const chatIds = await prismaClient.telegramChat.findMany({
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
        sendMessage(chatId.toString(), message, {
          parse_mode: 'HTML',
        }),
      ),
    );

  } catch (error) {
    console.error('Failed to send feedback:', error);
    handleTelegramError(error);
    throw error;
  }
};

export const feedbackAPIs = {
  notifyNewFeedback,
};

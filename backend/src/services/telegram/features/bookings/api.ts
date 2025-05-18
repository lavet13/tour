import { Booking, Role } from '@prisma/client';
import prisma from '@/prisma';
import { formatters } from '@/services/telegram/features/bookings/formatters';
import { sendMessage } from '@/services/telegram/services/message.service';
import { handleTelegramError } from '@/services/telegram/services/error.service';

const notifyNewBooking = async (
  booking: Booking,
  prismaClient: typeof prisma = prisma,
): Promise<void> => {
  try {
    const message = await formatters.formatBookingMessage(booking, prismaClient);

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
        sendMessage(chatId, message, {
          parse_mode: 'HTML',
          reply_markup: formatters.getBookingActionsKeyboard(booking.id),
        }),
      ),
    );
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    handleTelegramError(error);
    throw error;
  }
};

export const bookingsAPI = {
  notifyNewBooking,
};

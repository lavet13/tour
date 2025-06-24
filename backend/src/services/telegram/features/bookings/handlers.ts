import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { formatters } from '@/services/telegram/features/bookings/formatters';
import { sendMessage } from '@/services/telegram/services/message.service';
import { handleTelegramError } from '@/services/telegram/services/error.service';
import { CallbackHandler } from '../..';
import { $Enums } from '@prisma/client';

const bookingStatusChange: CallbackHandler['handle'] = async (
  bot,
  chatId,
  messageId,
  data,
  _query,
  prismaClient,
): Promise<void> => {
  let bookingId: string;

  if (data.startsWith('booking:status_')) {
    bookingId = data.replace('booking:status_', '');
  } else {
    console.error(`Invalid booking callback data: ${data}`);
    return;
  }

  try {
    const { status: currentStatus } =
      await prismaClient.booking.findUniqueOrThrow({
        where: { id: bookingId },
        select: {
          status: true,
        },
      });

    let newStatus: $Enums.BookingStatus | null = null;

    if (currentStatus === 'PENDING') {
      newStatus = 'CONFIRMED';
    }
    if (currentStatus === 'CONFIRMED') {
      newStatus = 'PENDING';
    }
    if (!newStatus) {
      throw new Error(`Не получилось установить статус.`);
    }

    const updatedBooking = await prismaClient.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: newStatus,
      },
      include: {
        route: {
          include: {
            departureCity: {
              select: {
                name: true,
              },
            },
            arrivalCity: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const formattedMessage = await formatters.formatBookingMessage(
      updatedBooking,
      prismaClient,
      updatedBooking.route,
    );

    let message = formattedMessage;
    if (updatedBooking.telegramId) {
      message += `\n\n✅ Уведомление отправлено пользователю в Telegram\n`;
      message += `<i>👀 Предварительный просмотр отправленного сообщения:</i>\n\n`;
      message += formatters.bookingMessageToSend(updatedBooking, newStatus);
    } else {
      message += `\n\n❌ Уведомление не было отправлено\n`;
      message += `<i>Причина: пользователь не был авторизован через Telegram при создании заявки</i>`;
    }

    const keyboard = formatters.getBookingActionsKeyboard(
      updatedBooking.id,
      newStatus,
    );

    await bot?.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });

    if (!updatedBooking.telegramId && newStatus === 'CONFIRMED') {
      await bot.sendMessage(
        chatId,
        formatters.bookingMessageToSend(updatedBooking, newStatus),
        { parse_mode: 'HTML' },
      );
    }
  } catch (error) {
    console.error('Error handling booking status change:', error);

    // Check if it's a not found error
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          // Record not found
          await sendMessage(
            chatId,
            `❌ Бронирование с ID ${bookingId} не существует.`,
          );
          return;
        case 'P2003':
          // Foreign key constraint violation
          await sendMessage(
            chatId,
            `❌ Ошибка: маршрут, связанный с бронированием, недействителен.`,
          );
          return;
        case 'P2002':
          // Unique constraint violation (unlikely in this case, but included for completeness)
          await sendMessage(
            chatId,
            `❌ Ошибка: нарушение уникальности данных бронирования.`,
          );
          return;
      }
    } else {
      handleTelegramError(error);
    }
  }
};

export const handlers = {
  bookingStatusChange,
};

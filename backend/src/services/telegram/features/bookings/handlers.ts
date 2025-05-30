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
    const { status: currentStatus } = await prismaClient.booking.findUniqueOrThrow({
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
      throw new Error('Не получилось установить статус. Статус равен NULL');
    }

    const booking = await prismaClient.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: newStatus,
      },
    });

    const message = await formatters.formatBookingMessage(booking, prismaClient);

    await bot?.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup: formatters.getBookingActionsKeyboard(booking.id, newStatus),
    });
  } catch (error) {
    console.error('Error handling booking status change:', error);

    // Check if it's a not found error
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      await sendMessage(
        chatId,
        `❌ Бронирование с ID ${bookingId} не существует.`,
      );
    } else {
      handleTelegramError(error);
    }
  }
};

export const handlers = {
  bookingStatusChange,
};

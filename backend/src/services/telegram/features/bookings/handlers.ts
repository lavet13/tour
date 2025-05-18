import { BookingStatus } from '@/graphql/__generated__/types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { formatters } from '@/services/telegram/features/bookings/formatters';
import { sendMessage } from '@/services/telegram/services/message.service';
import { handleTelegramError } from '@/services/telegram/services/error.service';
import { CallbackHandler } from '../..';

const bookingStatusChange: CallbackHandler['handle'] = async (
  bot,
  chatId,
  messageId,
  data,
  _query,
  prismaClient,
): Promise<void> => {
  let bookingId: string;
  let newStatus: BookingStatus;

  if (data.startsWith('booking:confirm_')) {
    bookingId = data.replace('booking:confirm_', '');
    newStatus = BookingStatus.Confirmed;
  } else if (data.startsWith('booking:pending_')) {
    bookingId = data.replace('booking:pending_', '');
    newStatus = BookingStatus.Pending;
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

    if (currentStatus === newStatus) return;

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
      reply_markup: formatters.getBookingActionsKeyboard(booking.id),
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

      await sendMessage(
        chatId,
        '❌ Не вышло обновить статус. Попробуйте позже.',
      );
    }
  }
};

export const handlers = {
  bookingStatusChange,
};

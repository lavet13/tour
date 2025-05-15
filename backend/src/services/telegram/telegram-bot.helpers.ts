import TelegramBot from 'node-telegram-bot-api';
import { getBotState, handleTelegramError } from './telegram-bot.core';
import { $Enums, Booking, Role } from '@prisma/client';
import {
  formatRussianDate,
  formatRussianDateTime,
} from '@/helpers/format-russian-date';
import prisma from '@/prisma';
import { BookingStatus } from '@/graphql/__generated__/types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Helper function to send a message with error handling
 * @param chatId Target chat ID
 * @param text Message text
 * @param options Message options
 * @returns Promise that resolves with the message or rejects with an error
 */
export const sendTelegramMessage = async (
  chatId: number | string,
  text: string,
  options?: TelegramBot.SendMessageOptions,
): Promise<TelegramBot.Message | null> => {
  const { bot } = getBotState();

  if (!bot) {
    console.error('Cannot send message: Telegram bot is not initialized');
    return null;
  }

  try {
    return await bot.sendMessage(chatId, text, options);
  } catch (error: unknown) {
    console.error(`Failed to send message to ${chatId}:`, error);

    handleTelegramError(error);

    return null;
  }
};

export function getBookingStatus(status: $Enums.BookingStatus) {
  if (status === 'PENDING') {
    return '💤 Ожидает';
  }
  if (status === 'CONFIRMED') {
    return '✅ Принят';
  }

  return '-';
}

export function formatBookingMessage(booking: Booking): string {
  return `
<b>📢 Новая заявка!</b>

<b><em>Фамилия</em></b>\n<code>${booking.lastName}</code>\n
<b><em>Имя</em></b>\n<code>${booking.firstName}</code>\n
<b><em>Телефон</em></b>\n${booking.phoneNumber}\n
<b><em>🪑 Мест</em></b> ${booking.seatsCount}\n
<b><em>🗓 Дата поездки</em></b>\n${formatRussianDate(booking.travelDate)}\n
<b><em>⏰ Создано</em></b>\n${formatRussianDateTime(booking.createdAt)}\n
<b>Статус</b>\n${getBookingStatus(booking.status)}
`;
}

/**
 * Create booking actions keyboard with confirm/pending buttons
 * @param bookingId ID of the booking
 * @returns Inline keyboard markup
 */
export function getBookingActionsKeyboard(bookingId: string) {
  return {
    inline_keyboard: [
      [
        {
          text: '✅ Принять',
          callback_data: `confirm_booking_${bookingId}`,
        },
        {
          text: '💤 Ожидать',
          callback_data: `pending_booking_${bookingId}`,
        },
      ],
    ],
  };
}

// Notify about a new booking
export const notifyNewBooking = async (
  booking: Booking,
  prismaClient: typeof prisma,
): Promise<void> => {
  const { bot, config } = getBotState();

  if (!bot || !config.enabled) return;

  try {
    const message = formatBookingMessage(booking);

    // Use Promise.all for concurrent message sending
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
        sendTelegramMessage(chatId, message, {
          parse_mode: 'HTML',
          reply_markup: getBookingActionsKeyboard(booking.id),
        }),
      ),
    );
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);

    handleTelegramError(error);

    throw error;
  }
};

/**
 * Handler for changing booking status via Telegram bot
 * @param chatId The Telegram chat ID of the user
 * @param bookingId The ID of the booking to update
 * @param newStatus The new status to set
 */
export async function handleBookingStatusChange(
  chatId: number | string,
  messageId: number,
  bookingId: string,
  newStatus: BookingStatus,
): Promise<void> {
  const { bot } = getBotState();
  if (!bot) return;

  try {
    // Update the booking
    const { status: currentStatus } = await prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      select: {
        status: true,
      },
    });

    if (currentStatus === newStatus) return;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    const message = formatBookingMessage(booking);

    await bot?.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup: getBookingActionsKeyboard(bookingId),
    });
  } catch (error) {
    console.error('Error handling booking status change:', error);

    // Check if it's a not found error
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      await sendTelegramMessage(
        chatId,
        `❌ Бронирование с ID ${bookingId} не существует.`,
      );
    } else {
      handleTelegramError(error);

      await sendTelegramMessage(
        chatId,
        '❌ Не вышло обновить статус. Попробуйте позже.',
      );
    }
  }
}

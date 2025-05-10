import TelegramBot from 'node-telegram-bot-api';
import { getBotState, handleTelegramError } from './telegram-bot.core';
import { $Enums, Booking } from '@prisma/client';

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

// Notify about a new booking
export const notifyNewBooking = async (booking: Booking): Promise<void> => {
  const { bot, config } = getBotState();

  if (!bot || !config.enabled) return;

  const getBookingStatus = (status: $Enums.BookingStatus) => {
    if (status === 'PENDING') {
      return 'Ожидает';
    }
    if (status === 'CONFIRMED') {
      return 'Принят';
    }

    return '-';
  };

  const formatBookingMessage = (booking: Booking): string => `
<b>📢 Новая заявка!</b>
<b>ID:</b> <code>${booking.id}</code>
<b>Фамилия и Имя:</b> ${booking.lastName} ${booking.firstName}
<b>Телефон:</b> ${booking.phoneNumber}
🪑 Мест: ${booking.seatsCount}
🗓 Дата поездки: ${new Date(booking.travelDate).toLocaleDateString()}
⏰ Создано: ${new Date(booking.createdAt).toLocaleString()}
<b>Статус:</b> ${getBookingStatus(booking.status)}
`;

  try {
    const message = formatBookingMessage(booking);

    // Use Promise.all for concurrent message sending
    await Promise.all(
      config.managerChatIds.map(chatId =>
        bot.sendMessage(chatId, message, { parse_mode: 'HTML' }),
      ),
    );
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);

    handleTelegramError(error);

    throw error;
  }
};

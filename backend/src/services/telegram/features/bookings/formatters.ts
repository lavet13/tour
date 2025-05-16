import { $Enums, Booking } from '@prisma/client';
import {
  formatRussianDate,
  formatRussianDateTime,
} from '@/helpers/format-russian-date';

/**
 * Format booking status for display
 * @param status Booking status
 * @returns Formatted status string
 */
const getBookingStatus = (status: $Enums.BookingStatus): string => {
  if (status === 'PENDING') {
    return '💤 Ожидает';
  }
  if (status === 'CONFIRMED') {
    return '✅ Принят';
  }

  return '-';
};

/**
 * Format booking details into a readable message
 * @param booking Booking object
 * @returns Formatted message in HTML
 */
const formatBookingMessage = (booking: Booking): string => {
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
};

/**
 * Create booking actions keyboard with confirm/pending buttons
 * @param bookingId ID of the booking
 * @returns Inline keyboard markup
 */
const getBookingActionsKeyboard = (bookingId: string) => {
  return {
    inline_keyboard: [
      [
        {
          text: '✅ Принять',
          callback_data: `booking:confirm_${bookingId}`,
        },
        {
          text: '💤 Ожидать',
          callback_data: `booking:pending_${bookingId}`,
        },
      ],
    ],
  };
};

export const formatters = {
  getBookingStatus,
  formatBookingMessage,
  getBookingActionsKeyboard,
};

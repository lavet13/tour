import {
  $Enums,
  Booking,
  BookingStatus,
  City,
  Prisma,
  Route,
} from '@prisma/client';
import {
  formatRussianDate,
  formatRussianDateTime,
} from '@/helpers/format-russian-date';
import prisma from '@/prisma';
import TelegramBot from 'node-telegram-bot-api';

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

type RouteWithCities = Prisma.RouteGetPayload<{
  include: {
    arrivalCity: { select: { name: true } };
    departureCity: { select: { name: true } };
  };
}>;

/**
 * Format booking details into a readable message
 * @param booking Booking object
 * @returns Formatted message in HTML
 */
const formatBookingMessage = async (
  booking: Booking,
  prismaClient: typeof prisma,
  route?: RouteWithCities | null,
): Promise<string> => {
  if (!route) {
    route = await prismaClient.route.findUniqueOrThrow({
      where: {
        id: booking.routeId as string,
      },
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
    });
  }

  const isForward = booking.direction === 'FORWARD';
  const isBackward = booking.direction === 'BACKWARD';

  let routeName: string = '';

  if (isForward) {
    routeName += `${route.departureCity.name} - ${route.arrivalCity.name}`;
  }

  if (isBackward) {
    routeName += `${route.arrivalCity.name} - ${route.departureCity.name}`;
  }

  let content = ``;

  content += `<b>📢 Новая заявка!</b>\n\n`;
  content += `<b>👤 Клиент</b>\n<code>${booking.lastName} ${booking.firstName}</code>\n\n`;
  content += `<b>📞 Основные контакты</b>\n`;
  content += `├ <b><em>Телефон</em></b>\n<a>${booking.phoneNumber}</a>\n`;

  if (booking.telegram) {
    const separator = booking.whatsapp ? `├` : `└`;
    content += `${separator} <b><em>Telegram</em></b>\n<a href="https://t.me/${booking.phoneNumber}">перейти к чату</a>${booking.whatsapp ? `\n` : `\n\n`}`;
  }
  if (booking.whatsapp) {
    content += `└ <b><em>Whatsapp</em></b>\n<a href="https://wa.me/${booking.phoneNumber}">перейти к чату</a>\n\n`;
  }

  if (booking.extraPhoneNumber) {
    content += `<b>📱 Дополнительные контакты</b>\n`;
  }

  if (booking.extraPhoneNumber) {
    content += `├ <b><em>Телефон</em></b>\n${booking.extraPhoneNumber}\n`;
  }

  if (booking.extraTelegram) {
    const separator = booking.extraWhatsapp ? `├` : `└`;
    content += `${separator} <b><em>Telegram</em></b>\n<a href="https://t.me/${booking.extraPhoneNumber}">перейти к чату</a>${booking.extraWhatsapp ? `\n` : `\n\n`}`;
  }
  if (booking.extraWhatsapp) {
    content += `└ <b><em>Whatsapp: </em></b>\n<a href="https://wa.me/${booking.extraPhoneNumber}">перейти к чату</a>\n\n`;
  }

  content += `<b>🚍 Маршрут</b>\n${routeName}\n\n`;

  content += `<b>🪑 Мест</b>\n${booking.seatsCount}\n\n`;

  content += `<b>📅 Дата поездки</b>\n${formatRussianDate(booking.travelDate)}\n\n`;

  content += `<b>⏰ Дата создания</b>\n${formatRussianDateTime(booking.createdAt)}\n\n`;

  content += `<b>Статус</b>\n${getBookingStatus(booking.status)}`;

  return content;
};

/**
 * Create booking actions keyboard with confirm/pending buttons
 * @param bookingId ID of the booking
 * @returns Inline keyboard markup
 */
const getBookingActionsKeyboard = (
  bookingId: string,
  status: BookingStatus,
): TelegramBot.InlineKeyboardMarkup => {
  const buttons = [];

  let text: string = '';

  if (status === 'PENDING') {
    text = '✅ Принять';
  }
  if (status === 'CONFIRMED') {
    text = '💤 Ожидать';
  }

  buttons.push({
    text,
    callback_data: `booking:status_${bookingId}`,
  });

  return {
    inline_keyboard: [buttons],
  };
};

export const formatters = {
  getBookingStatus,
  formatBookingMessage,
  getBookingActionsKeyboard,
};

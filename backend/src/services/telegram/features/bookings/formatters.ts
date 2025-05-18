import { $Enums, Booking, Route } from '@prisma/client';
import {
  formatRussianDate,
  formatRussianDateTime,
} from '@/helpers/format-russian-date';
import prisma from '@/prisma';

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
const formatBookingMessage = async (
  booking: Booking,
  prismaClient: typeof prisma,
): Promise<string> => {
  const route = await prismaClient.route.findUniqueOrThrow({
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

  const isForward = booking.direction === 'FORWARD';
  const isBackward = booking.direction === 'BACKWARD';

  let routeName: string = '';

  if (isForward) {
    routeName += `${route.departureCity.name} - ${route.arrivalCity.name}`;
  }

  if (isBackward) {
    routeName += `${route.arrivalCity.name} - ${route.departureCity.name}`;
  }

  let mainWhatsapp: string = ``;
  let extraWhatsapp: string = ``;

  if (booking.whatsapp) {
    mainWhatsapp += `<b><em>Whatsapp(основной)</em></b>\n<a>${booking.phoneNumber}</a>`;
  }

  if (booking.extraWhatsapp) {
    extraWhatsapp += `<b><em>Whatsapp(доп.)</em></b>\n<a>${booking.extraWhatsapp}</a>`;
  }

  return `
<b>📢 Новая заявка!</b>

<b><em>Фамилия</em></b>\n<code>${booking.lastName}</code>\n
<b><em>Имя</em></b>\n<code>${booking.firstName}</code>\n
<b><em>Телефон(основной)</em></b>\n${booking.phoneNumber}
${mainWhatsapp}
${booking.extraPhoneNumber ? `<b><em>Телефон(доп.)</em></b>\n${booking.extraPhoneNumber}` : ``}
${extraWhatsapp}
<b><em>Маршрут</em></b>\n${routeName}\n
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

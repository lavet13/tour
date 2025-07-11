import {
  formatRussianDate,
  formatRussianDateTime,
} from '@/helpers/format-russian-date';
import { $Enums, BookingStatus, Prisma } from '@prisma/client';
import { InlineKeyboard } from 'grammy';

export const formatBookingMessage = async (
  booking: Prisma.BookingGetPayload<{
    include: {
      route: {
        include: {
          arrivalCity: {
            select: {
              name: true;
            };
          };
          departureCity: {
            select: {
              name: true;
            };
          };
        };
      };
    };
  }>,
): Promise<string> => {
  const isForward = booking.direction === 'FORWARD';
  const isBackward = booking.direction === 'BACKWARD';

  let routeName: string = '';

  if (isForward) {
    routeName += `${booking.route?.departureCity.name} - ${booking.route?.arrivalCity.name}`;
  }

  if (isBackward) {
    routeName += `${booking.route?.arrivalCity.name} - ${booking.route?.departureCity.name}`;
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

export const confirmedBookingMessage = (
  updatedBooking: Prisma.BookingGetPayload<{
    include: {
      route: {
        include: {
          departureCity: {
            select: {
              name: true;
            };
          };
          arrivalCity: {
            select: {
              name: true;
            };
          };
        };
      };
    };
  }>,
  { richText = false } = {},
) => {
  let routeName = '';
  const isForward = updatedBooking.direction === 'FORWARD';
  const isBackward = updatedBooking.direction === 'BACKWARD';

  if (isForward) {
    routeName += `${updatedBooking.route?.departureCity.name} → ${updatedBooking.route?.arrivalCity.name}`;
  }

  if (isBackward) {
    routeName += `${updatedBooking.route?.arrivalCity.name} → ${updatedBooking.route?.departureCity.name}`;
  }

  let message = '';

  if (richText) {
    message += `🎉 Ваша <b>БРОНЬ ПРИНЯТА.</b> За день до выезда с Вами свяжется диспетчер и даст полную информацию по поездке.\n\n`;
    message += `🚌 <b>Маршрут:</b> ${routeName}\n`;
    message += `💰 <b>Цена:</b> ${updatedBooking.route?.price} ₽\n`;
    message += `📅 <b>Дата поездки:</b> ${formatRussianDate(updatedBooking.travelDate)}\n`;
    message += `🪑 <b>Мест:</b> ${updatedBooking.seatsCount}\n\n`;
    message += `📞 Ожидайте звонка диспетчера для уточнения деталей.\n\n`;
    message += `♥ Спасибо, что обратились к нам!`;
  } else {
    message += `Ваша бронь ПРИНЯТА. Диспетчер свяжется за день до выезда.\n\n`;
    message += `Маршрут: ${routeName}\n`;
    message += `Цена: ${updatedBooking.route?.price} ₽\n`;
    message += `Дата: ${formatRussianDate(updatedBooking.travelDate)}\n`;
    message += `Мест: ${updatedBooking.seatsCount}\n\n`;
    message += `Ожидайте звонка для уточнения деталей.\n\n`;
    message += `Спасибо!`;
  }

  return message;
};

export const getBookingStatus = (status: $Enums.BookingStatus): string => {
  if (status === 'PENDING') {
    return '💤 Ожидает';
  }
  if (status === 'CONFIRMED') {
    return '✅ Принят';
  }

  return '❌ Ошибка';
};

export const getInlineKeyboardForBookings = (
  bookingId: string,
  status: BookingStatus,
  copiedText?: string,
): InlineKeyboard => {
  const inlineKeyboard = new InlineKeyboard();

  let text: string = '';

  if (status === 'PENDING') {
    text = '✅ Принять';
  }
  if (status === 'CONFIRMED') {
    text = '💤 Ожидать';
  }

  inlineKeyboard.text(text, `booking:status_${bookingId}`);

  if (copiedText && status === 'CONFIRMED') {
    inlineKeyboard.copyText('📝 Копировать бронь', copiedText);
  }

  return inlineKeyboard;
};

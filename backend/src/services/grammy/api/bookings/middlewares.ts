import prisma from '@/prisma';
import { $Enums } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  confirmedBookingMessage,
  getBookingStatus,
  getInlineKeyboardForBookings,
  formatBookingMessage,
} from '@/services/grammy/api/bookings/formatters';
import { CallbackQueryMiddleware } from 'grammy';
import { CustomContext } from '../..';

export const handleBookingStatus: CallbackQueryMiddleware<
  CustomContext
> = async ctx => {
  const bookingId = ctx.match[1];

  let newStatus: $Enums.BookingStatus | null = null;

  try {
    const { status: currentStatus } = await prisma.booking.findUniqueOrThrow({
      where: {
        id: bookingId,
      },
      select: {
        status: true,
      },
    });

    if (currentStatus === 'PENDING') {
      newStatus = 'CONFIRMED';
    }
    if (currentStatus === 'CONFIRMED') {
      newStatus = 'PENDING';
    }
    if (!newStatus) {
      throw new Error(`Не получилось установить статус.`);
    }

    const updatedBooking = await prisma.booking.update({
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

    const msgToManager = await formatBookingMessage(updatedBooking);
    let message = msgToManager;

    if (newStatus === 'CONFIRMED') {
      if (updatedBooking.telegramId) {
        message += `\n\n✅ Уведомление отправлено пользователю в Telegram\n`;
        message += `<i>👀 Предварительный просмотр отправленного сообщения:</i>\n\n`;
        message += confirmedBookingMessage(updatedBooking, { richText: true });

        await ctx.api.sendMessage(
          updatedBooking.telegramId.toString(),
          confirmedBookingMessage(updatedBooking, { richText: true }),
          { parse_mode: 'HTML' },
        );
      } else {
        message += `\n\n❌ Уведомление не было отправлено\n`;
        message += `<i>Причина: пользователь не был авторизован через Telegram при создании заявки</i>`;
      }
    }

    const inlineKeyboard = getInlineKeyboardForBookings(
      updatedBooking.id,
      newStatus,
      confirmedBookingMessage(updatedBooking),
    );

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard,
    });
  } catch (error) {
    // Check if it's a not found error
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          // Record not found
          await ctx.reply(`❌ Бронирование с ID ${bookingId} не существует.`);
          return;
        case 'P2003':
          // Foreign key constraint violation
          await ctx.reply(
            `❌ Ошибка: маршрут, связанный с бронированием, недействителен.`,
          );
          return;
        case 'P2002':
          // Unique constraint violation (unlikely in this case, but included for completeness)
          await ctx.reply(
            `❌ Ошибка: нарушение уникальности данных бронирования.`,
          );
          return;
      }
    }
    throw error;
  } finally {
    await ctx.answerCallbackQuery({
      ...(newStatus
        ? { text: `Статус изменен на ${getBookingStatus(newStatus)}!` }
        : {}),
    });
  }
};

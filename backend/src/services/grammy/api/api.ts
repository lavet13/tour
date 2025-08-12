import { BotError, Composer } from 'grammy';
import {
  handleBookingSendMessage,
  handleBookingSendNoAvailabilityMessage,
  handleBookingStatus,
} from '@/services/grammy/api/bookings/middlewares';
import { CustomContext } from '@/services/grammy/types';

const api = new Composer().errorBoundary((error: BotError<CustomContext>) => {
  console.error('Error in booking API:', error);

  const ctx = error.ctx;

  // Check if it's a callback query that we can answer
  if (ctx.callbackQuery) {
    const originalError = error.error;

    // Check if it's a network/connection error
    if (originalError instanceof Error) {
      const errorWithCode = error as Error & { code?: string };
      const isNetworkError =
        originalError.message.includes('ENOTFOUND') ||
        originalError.message.includes('ECONNREFUSED') ||
        originalError.message.includes('timeout') ||
        originalError.message.includes('Network') ||
        errorWithCode.code === 'ETIMEDOUT' ||
        errorWithCode.code === 'ECONNRESET';

      if (isNetworkError) {
        ctx
          .answerCallbackQuery({
            text: '❌ Сервер не отвечает. Попробуйте позже.',
            show_alert: true,
          })
          .catch(answerError => {
            console.error(
              'Failed to answer callback query after network error:',
              answerError,
            );
          });
        return;
      }
    }

    // For other errors, show generic error message
    ctx
      .answerCallbackQuery({
        text: '❌ Произошла ошибка. Попробуйте позже.',
        show_alert: true,
      })
      .catch(answerError => {
        console.error(
          'Failed to answer callback query after error:',
          answerError,
        );
      });
  }
});

api.callbackQuery(/booking:status_(.*)/, handleBookingStatus);

api.callbackQuery(/booking:send-message_(.*)/, handleBookingSendMessage);

api.callbackQuery(
  /booking:send-no-availability_(.*)/,
  handleBookingSendNoAvailabilityMessage,
);

export { api };

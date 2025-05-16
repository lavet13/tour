import type { TelegramBotConfig } from '@/services/telegram';

export const config: TelegramBotConfig = {
  enabled: import.meta.env.VITE_TELEGRAM_BOT_ENABLED === 'true',
  botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
  miniAppUrl: import.meta.env.VITE_TELEGRAM_MINI_APP_URL || '',
};

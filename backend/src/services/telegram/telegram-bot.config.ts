import type { TelegramBotConfig } from '@/services/telegram';

export const config: TelegramBotConfig = {
  enabled: import.meta.env.VITE_TELEGRAM_BOT_ENABLED === 'true',
  botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
  managerChatIds: (import.meta.env.VITE_TELEGRAM_MANAGER_CHAT_IDS || '')
    .split(',')
    .filter(id => id.trim() !== ''),
};

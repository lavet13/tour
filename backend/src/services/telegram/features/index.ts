import { contactsFeature } from '@/services/telegram/features/contacts';
import { appFeature } from '@/services/telegram/features/app';
import { mainMenuFeature } from '@/services/telegram/features/main-menu';
import { BotFeature } from '@/services/telegram/telegram-bot.types';
import { bookingsFeature } from '@/services/telegram/features/bookings';
import { bookingsAPI } from '@/services/telegram/features/bookings/api';

/**
 * Register all features with the bot
 * @returns Array of registered features
 */
export const getFeatures = (): BotFeature[] => {
  return [contactsFeature, appFeature, mainMenuFeature, bookingsFeature];
};

export const getPublicAPIs = () => ({
  ...bookingsAPI,
});

export * from './app';
export * from './contacts';
export * from './main-menu';
export * from './bookings';

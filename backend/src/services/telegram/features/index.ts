import { contactsFeature } from '@/services/telegram/features/contacts';
import { appFeature } from '@/services/telegram/features/app';
import { mainMenuFeature } from '@/services/telegram/features/main-menu';
import { BotFeature } from '@/services/telegram/telegram-bot.types';
import { bookingsFeature } from '@/services/telegram/features/bookings';

const features = [
  contactsFeature,
  appFeature,
  mainMenuFeature,
  bookingsFeature,
];

/**
 * Register all features with the bot
 * @returns Array of registered features
 */
export const registerFeatures = (): BotFeature[] => {
  return [contactsFeature, appFeature, mainMenuFeature, bookingsFeature];
};

export const registerPublicAps = () =>
  features.reduce((acc, feature) => {
    return acc.set(feature.name, feature);
  }, new Map<string, BotFeature>());

export * from './app';
export * from './contacts';
export * from './main-menu';
export * from './bookings';

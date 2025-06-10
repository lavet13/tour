import { addHours, format, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Форматирует дату в российском формате с названием месяца
 * @param date Дата для форматирования
 * @returns Отформатированная строка даты
 */
export const formatRussianDate = (date: Date | string | number): string => {
  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      console.error('Invalid dateObj:', date);
      return 'Invalid Date';
    }

    const eestDate = addHours(dateObj, 3);

    const normalizedDate = startOfDay(eestDate);

    return format(normalizedDate, 'd MMMM yyyy г.', { locale: ru });
  } catch (error) {
    console.error('Error in formatRussianDate:', error, 'Input:', date);
    return 'Error Formatting Date';
  }
};

/**
 * Форматирует дату и время в российском формате
 * @param date Дата для форматирования
 * @returns Отформатированная строка даты и времени
 */
export const formatRussianDateTime = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  return format(dateObj, 'd MMMM yyyy г., HH:mm', { locale: ru });
};

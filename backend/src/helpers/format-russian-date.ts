import { format } from "date-fns";
import { ru } from "date-fns/locale";

/**
 * Форматирует дату в российском формате с названием месяца
 * @param date Дата для форматирования
 * @returns Отформатированная строка даты
 */
export const formatRussianDate = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  return format(dateObj, 'd MMMM yyyy г.', { locale: ru });
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

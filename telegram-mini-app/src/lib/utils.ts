import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Исходный regex из Zod:
// /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;
export const getEmailErrorMessage = (email: string) => {
  if (!email || email.trim() === "") {
    return "Поле email обязательно для заполнения";
  }

  // Проверка: не может начинаться с точки (?!\.)
  if (email.startsWith(".")) {
    return "Email не может начинаться с точки";
  }

  // Проверка: не может содержать две точки подряд (?!.*\.\.)
  if (email.includes("..")) {
    return "Email не может содержать две точки подряд";
  }

  // Проверка наличия @
  if (!email.includes("@")) {
    return "Email должен содержать символ @";
  }

  // Разделение на части
  const atIndex = email.lastIndexOf("@"); // используем lastIndexOf для корректной обработки
  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex + 1);

  // Проверка локальной части: ([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]
  if (localPart.length === 0) {
    return "Email не может начинаться с символа @";
  }

  // Последний символ локальной части должен быть [A-Za-z0-9_+-]
  const lastLocalChar = localPart[localPart.length - 1];
  if (!/[A-Za-z0-9_+-]/.test(lastLocalChar)) {
    return "Локальная часть email должна заканчиваться буквой, цифрой или символом _ + -";
  }

  // Все символы локальной части должны быть [A-Za-z0-9_'+\-\.]
  if (!/^[A-Za-z0-9_'+\-\.]*$/.test(localPart)) {
    return "Локальная часть email может содержать только буквы, цифры и символы: _ ' + - .";
  }

  // Проверка доменной части: ([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}
  if (domainPart.length === 0) {
    return "Email должен содержать доменную часть после @";
  }

  // Домен должен заканчиваться на доменную зону из минимум 2 букв
  const domainZoneMatch = domainPart.match(/\.([A-Za-z]{2,})$/);
  if (!domainZoneMatch) {
    return "Доменная часть должна заканчиваться доменной зоной из минимум 2 букв (например, .com, .ru)";
  }

  // Убираем доменную зону и проверяем остальную часть
  const domainWithoutZone = domainPart.substring(
    0,
    domainPart.length - domainZoneMatch[0].length,
  );

  if (domainWithoutZone.length === 0) {
    return "Доменная часть должна содержать имя домена перед доменной зоной";
  }

  // Проверка сегментов домена: ([A-Za-z0-9][A-Za-z0-9\-]*\.)+
  const domainSegments = domainWithoutZone.split(".");

  for (let i = 0; i < domainSegments.length; i++) {
    const segment = domainSegments[i];

    if (segment.length === 0) {
      return "Доменная часть не может содержать пустые сегменты";
    }

    // Каждый сегмент должен начинаться с буквы или цифры
    if (!/^[A-Za-z0-9]/.test(segment)) {
      return "Каждый сегмент домена должен начинаться с буквы или цифры";
    }

    // Остальные символы могут быть буквами, цифрами или дефисами
    if (!/^[A-Za-z0-9][A-Za-z0-9\-]*$/.test(segment)) {
      return "Сегменты домена могут содержать только буквы, цифры и дефисы";
    }
  }

  return "Неверный формат email адреса";
};

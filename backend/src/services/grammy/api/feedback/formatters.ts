import { formatRussianDateTime } from '@/helpers/format-russian-date';
import { Feedback } from '@prisma/client';

function getHeaderByReason(reason: string) {
  const headers: Record<string, string> = {
    жалоба: '😔 <b>Жалоба</b>',
    предложение: '💡 <b>Предложение</b>',
    вопрос: '❓ <b>Вопрос от пользователя</b>',
    'техническая проблема': '🐛 <b>Сообщение об ошибке</b>',
  };

  let header = headers[reason.toLowerCase()];

  if (!header) {
    header = '📝 <b>Обращение от пользователя</b>';
  }

  return header;
}

export function formatFeedbackMessage(feedback: Feedback) {
  let content = ``;

  const header = getHeaderByReason(feedback.reason);
  content += `${header}\n\n`;

  if (feedback.replyTo) {
    content += `👤 <b>Контакт:</b> ${feedback.replyTo}\n`;
  }

  content += `📅 <b>Дата:</b> ${formatRussianDateTime(feedback.createdAt)}\n\n`;

  content += `💬 <b>Сообщение</b>\n`;
  content += `${feedback.message}`;

  return content;
}

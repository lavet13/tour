import DataLoader from 'dataloader';
import prismaClient from '@/prisma';
import { TelegramChat } from '@prisma/client';

export const createTelegramChatIdsLoader = (prisma: typeof prismaClient) => {
  return new DataLoader<string, TelegramChat[]>(
    async (userIds: readonly string[]) => {
      const telegramChats = await prisma.telegramChat.findMany({
        where: {
          userId: { in: userIds as string[] },
        },
      });

      const chatsByUserId = new Map<string, TelegramChat[]>();

      for (const chat of telegramChats) {
        if (!chatsByUserId.has(chat.chatId)) {
          chatsByUserId.set(chat.chatId, []);
        }
        chatsByUserId.get(chat.chatId)?.push(chat);
      }

      return userIds.map(userId => chatsByUserId.get(userId) || []);
    },
  );
};

// return new DataLoader<string, TelegramChat[]>(
//   async (userIds: readonly string[]) => {
//     const telegramChats = await prisma.telegramChat.findMany({
//       where: {
//         users: {
//           some: {
//             id: {
//               in: [...userIds],
//             },
//           },
//         },
//       },
//       include: {
//         users: true,
//       },
//     });
//
//     console.log({ userIds });
//
//     const chatsByUserId = new Map<string, TelegramChat[]>();
//
//     // Initialize with empty arrays for all requested userIds
//     userIds.forEach(userId => {
//       chatsByUserId.set(userId, []);
//     });
//
//     // For each chat, add it to the array for each associated user
//     for (const chat of telegramChats) {
//       for (const user of chat.users) {
//         // If this user is one of our requested users
//         if (userIds.includes(user.id)) {
//           const userChats = chatsByUserId.get(user.id) || [];
//           userChats.push(chat);
//           chatsByUserId.set(user.id, userChats);
//         }
//       }
//     }
//
//     // Return chats for each userId in the same order as requested
//     return userIds.map(userId => chatsByUserId.get(userId) || []);
//   },
// );

/*
  Warnings:

  - You are about to drop the `_TelegramChatToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `TelegramChat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_TelegramChatToUser" DROP CONSTRAINT "_TelegramChatToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_TelegramChatToUser" DROP CONSTRAINT "_TelegramChatToUser_B_fkey";

-- AlterTable
ALTER TABLE "TelegramChat" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_TelegramChatToUser";

-- AddForeignKey
ALTER TABLE "TelegramChat" ADD CONSTRAINT "TelegramChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

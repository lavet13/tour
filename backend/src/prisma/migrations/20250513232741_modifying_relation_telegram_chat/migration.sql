/*
  Warnings:

  - You are about to drop the column `userId` on the `TelegramChat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TelegramChat" DROP CONSTRAINT "TelegramChat_userId_fkey";

-- AlterTable
ALTER TABLE "TelegramChat" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "_TelegramChatToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TelegramChatToUser_AB_unique" ON "_TelegramChatToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TelegramChatToUser_B_index" ON "_TelegramChatToUser"("B");

-- AddForeignKey
ALTER TABLE "_TelegramChatToUser" ADD CONSTRAINT "_TelegramChatToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "TelegramChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TelegramChatToUser" ADD CONSTRAINT "_TelegramChatToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

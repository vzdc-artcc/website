/*
  Warnings:

  - A unique constraint covering the columns `[discordUid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User"
    ADD COLUMN "discordUid" TEXT,
ADD COLUMN     "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/New_York';

-- CreateIndex
CREATE UNIQUE INDEX "User_discordUid_key" ON "User" ("discordUid");

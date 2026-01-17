/*
  Warnings:

  - Added the required column `name` to the `DiscordConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DiscordConfig" ADD COLUMN     "name" TEXT NOT NULL;

/*
  Warnings:

  - A unique constraint covering the columns `[alias]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "File"
    ADD COLUMN "alias" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "File_alias_key" ON "File" ("alias");

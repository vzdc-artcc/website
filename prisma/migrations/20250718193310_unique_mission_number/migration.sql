/*
  Warnings:

  - A unique constraint covering the columns `[missionNumber]` on the table `SuaBlock` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `missionNumber` to the `SuaBlock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SuaBlock"
    ADD COLUMN "missionNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SuaBlock_missionNumber_key" ON "SuaBlock" ("missionNumber");

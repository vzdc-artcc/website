/*
  Warnings:

  - You are about to drop the column `deleteTrainingAssignmentOnPass` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "deleteTrainingAssignmentOnPass",
ADD COLUMN     "releaseRequestOnPass" BOOLEAN NOT NULL DEFAULT false;

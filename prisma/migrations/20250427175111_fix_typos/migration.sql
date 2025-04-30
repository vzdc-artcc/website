/*
  Warnings:

  - You are about to drop the column `traineePreperation` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `preperationCompleted` on the `TrainingAppointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "traineePreperation",
ADD COLUMN     "traineePreparation" TEXT;

-- AlterTable
ALTER TABLE "TrainingAppointment" DROP COLUMN "preperationCompleted",
ADD COLUMN     "preparationCompleted" BOOLEAN NOT NULL DEFAULT false;

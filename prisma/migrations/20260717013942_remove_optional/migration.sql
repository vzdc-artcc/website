/*
  Warnings:

  - Made the column `notes` on table `TrainingAppointment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TrainingAppointment"
    ALTER COLUMN "notes" SET NOT NULL;

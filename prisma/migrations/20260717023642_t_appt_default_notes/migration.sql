/*
  Warnings:

  - Made the column `notes` on table `TrainingAppointment` required. This step will fail if there are existing NULL values in that column.

*/
-- Backfill existing NULLs before enforcing NOT NULL
UPDATE "TrainingAppointment"
SET "notes" = ''
WHERE "notes" IS NULL;

-- AlterTable
ALTER TABLE "TrainingAppointment"
    ALTER COLUMN "notes" SET DEFAULT '',
ALTER
COLUMN "notes" SET NOT NULL;
-- AlterTable
ALTER TABLE "TrainingAppointment"
    ADD COLUMN "doubleBooking" BOOLEAN NOT NULL DEFAULT false;

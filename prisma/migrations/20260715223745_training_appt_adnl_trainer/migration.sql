/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,trainerId]` on the table `TrainingSessionAdditionalTrainer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "TrainingAppointmentAdditionalTrainer"
(
    "id"            TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "trainerId"     TEXT NOT NULL,
    "description"   TEXT NOT NULL,

    CONSTRAINT "TrainingAppointmentAdditionalTrainer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrainingAppointmentAdditionalTrainer_appointmentId_trainerI_key" ON "TrainingAppointmentAdditionalTrainer" ("appointmentId", "trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingSessionAdditionalTrainer_sessionId_trainerId_key" ON "TrainingSessionAdditionalTrainer" ("sessionId", "trainerId");

-- AddForeignKey
ALTER TABLE "TrainingAppointmentAdditionalTrainer"
    ADD CONSTRAINT "TrainingAppointmentAdditionalTrainer_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "TrainingAppointment" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAppointmentAdditionalTrainer"
    ADD CONSTRAINT "TrainingAppointmentAdditionalTrainer_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

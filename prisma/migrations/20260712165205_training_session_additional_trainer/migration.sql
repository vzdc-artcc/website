-- CreateTable
CREATE TABLE "TrainingSessionAdditionalTrainer"
(
    "id"          TEXT NOT NULL,
    "sessionId"   TEXT NOT NULL,
    "trainerId"   TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "TrainingSessionAdditionalTrainer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrainingSessionAdditionalTrainer"
    ADD CONSTRAINT "TrainingSessionAdditionalTrainer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSessionAdditionalTrainer"
    ADD CONSTRAINT "TrainingSessionAdditionalTrainer_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

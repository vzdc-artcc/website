-- AlterTable
ALTER TABLE "Lesson"
    ADD COLUMN "duration" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "traineePreperation" TEXT;

-- CreateTable
CREATE TABLE "TrainingAppointment"
(
    "id"                   TEXT         NOT NULL,
    "studentId"            TEXT         NOT NULL,
    "trainerId"            TEXT         NOT NULL,
    "start"                TIMESTAMP(3) NOT NULL,
    "preperationCompleted" BOOLEAN      NOT NULL DEFAULT false,
    "warningEmailSent"     BOOLEAN      NOT NULL DEFAULT false,

    CONSTRAINT "TrainingAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LessonToTrainingAppointment"
(
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LessonToTrainingAppointment_AB_pkey" PRIMARY KEY ("A", "B")
);

-- CreateIndex
CREATE INDEX "_LessonToTrainingAppointment_B_index" ON "_LessonToTrainingAppointment" ("B");

-- AddForeignKey
ALTER TABLE "TrainingAppointment"
    ADD CONSTRAINT "TrainingAppointment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAppointment"
    ADD CONSTRAINT "TrainingAppointment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonToTrainingAppointment"
    ADD CONSTRAINT "_LessonToTrainingAppointment_A_fkey" FOREIGN KEY ("A") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonToTrainingAppointment"
    ADD CONSTRAINT "_LessonToTrainingAppointment_B_fkey" FOREIGN KEY ("B") REFERENCES "TrainingAppointment" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

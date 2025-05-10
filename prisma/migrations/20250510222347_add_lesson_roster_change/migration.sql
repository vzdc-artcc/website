-- CreateTable
CREATE TABLE "LessonRosterChange"
(
    "id"                  TEXT                  NOT NULL,
    "lessonId"            TEXT                  NOT NULL,
    "certificationTypeId" TEXT                  NOT NULL,
    "certificationOption" "CertificationOption" NOT NULL,
    "dossierText"         TEXT                  NOT NULL,
    "timestamp"           TIMESTAMP(3)          NOT NULL,

    CONSTRAINT "LessonRosterChange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LessonRosterChange"
    ADD CONSTRAINT "LessonRosterChange_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonRosterChange"
    ADD CONSTRAINT "LessonRosterChange_certificationTypeId_fkey" FOREIGN KEY ("certificationTypeId") REFERENCES "CertificationType" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

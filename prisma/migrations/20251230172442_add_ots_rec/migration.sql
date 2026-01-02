-- CreateTable
CREATE TABLE "OtsRecommendation"
(
    "id"                   TEXT         NOT NULL,
    "studentId"            TEXT         NOT NULL,
    "assignedInstructorId" TEXT,
    "attempingRating"      INTEGER      NOT NULL,
    "notes"                TEXT         NOT NULL,
    "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtsRecommendation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OtsRecommendation"
    ADD CONSTRAINT "OtsRecommendation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtsRecommendation"
    ADD CONSTRAINT "OtsRecommendation_assignedInstructorId_fkey" FOREIGN KEY ("assignedInstructorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

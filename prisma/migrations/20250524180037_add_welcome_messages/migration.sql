-- AlterTable
ALTER TABLE "User"
    ADD COLUMN "showWelcomeMessage" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "WelcomeMessages"
(
    "id"          TEXT NOT NULL,
    "homeText"    TEXT NOT NULL,
    "visitorText" TEXT NOT NULL,

    CONSTRAINT "WelcomeMessages_pkey" PRIMARY KEY ("id")
);

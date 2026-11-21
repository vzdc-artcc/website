-- AlterTable
ALTER TABLE "File"
    ADD COLUMN "isGoap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTrainingOrder" BOOLEAN NOT NULL DEFAULT false;

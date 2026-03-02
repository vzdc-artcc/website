-- AlterTable
ALTER TABLE "Event"
    ADD COLUMN "enableBufferTimes" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "EventPosition"
    ADD COLUMN "requestedSecondaryPosition" TEXT NOT NULL DEFAULT 'UNKNOWN';

/*
  Warnings:

  - Made the column `opsPlanPublished` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isCic` on table `EventPosition` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isInstructor` on table `EventPosition` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isOts` on table `EventPosition` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isSolo` on table `EventPosition` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isTmu` on table `EventPosition` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "opsPlannerId" TEXT,
ALTER COLUMN "opsPlanPublished" SET NOT NULL;

-- AlterTable
ALTER TABLE "EventPosition" ALTER COLUMN "isCic" SET NOT NULL,
ALTER COLUMN "isInstructor" SET NOT NULL,
ALTER COLUMN "isOts" SET NOT NULL,
ALTER COLUMN "isSolo" SET NOT NULL,
ALTER COLUMN "isTmu" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_opsPlannerId_fkey" FOREIGN KEY ("opsPlannerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

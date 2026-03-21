-- CreateEnum
CREATE TYPE "TmiCategory" AS ENUM ('LOCAL', 'TERMINAL', 'ENROUTE');

-- CreateEnum
CREATE TYPE "ControllingCategory" AS ENUM ('ADMIN', 'ENROUTE', 'TERMINAL', 'LOCAL');

-- AlterEnum
ALTER TYPE "LogModel" ADD VALUE 'OPS_PLAN_FILE';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "featuredFieldConfigs" JSONB,
ADD COLUMN     "opsFreeText" TEXT,
ADD COLUMN     "opsPlanPublished" BOOLEAN DEFAULT false,
ADD COLUMN     "tmis" TEXT;

-- AlterTable
ALTER TABLE "EventPosition" ADD COLUMN     "controllingCategory" "ControllingCategory",
ADD COLUMN     "isCic" BOOLEAN DEFAULT false,
ADD COLUMN     "isInstructor" BOOLEAN DEFAULT false,
ADD COLUMN     "isOts" BOOLEAN DEFAULT false,
ADD COLUMN     "isSolo" BOOLEAN DEFAULT false,
ADD COLUMN     "isTmu" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "EventTmi" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "category" "TmiCategory" NOT NULL,
    "text" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventTmi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsPlanFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "key" TEXT NOT NULL,
    "createdBy" TEXT,
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsPlanFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventTmi_eventId_idx" ON "EventTmi"("eventId");

-- CreateIndex
CREATE INDEX "OpsPlanFile_eventId_idx" ON "OpsPlanFile"("eventId");

-- AddForeignKey
ALTER TABLE "EventTmi" ADD CONSTRAINT "EventTmi_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsPlanFile" ADD CONSTRAINT "OpsPlanFile_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

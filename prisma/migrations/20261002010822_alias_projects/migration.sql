/*
  Warnings:

  - The values [INNOVATION_LAB_PROJECT_UPDATE] on the enum `LogModel` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[alias]` on the table `InnovationLabProject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alias` to the `InnovationLabProject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LogModel_new" AS ENUM ('USER', 'BROADCAST', 'STAFF_POSITION', 'LOA', 'ROLE', 'EVENT', 'EVENT_POSITION', 'EVENT_POSITION_PRESET', 'FILE_CATEGORY', 'FILE', 'STAFFING_REQUEST', 'AIRPORT_TRACON_GROUP', 'AIRPORT_RUNWAY', 'AIRPORT_PROCEDURE', 'AIRPORT', 'FEEDBACK', 'VISITOR_APPLICATION', 'SOLO_CERTIFICATION', 'CERTIFICATION', 'CERTIFICATION_TYPE', 'LESSON', 'COMMON_MISTAKE', 'LESSON_RUBRIC', 'TRAINING_SESSION', 'INCIDENT_REPORT', 'EMAIL', 'USER_SETTINGS', 'STATISTICS_PREFIXES', 'TRAINING_ASSIGNMENT', 'TRAINING_ASSIGNMENT_REQUEST', 'TRAINER_RELEASE_REQUEST', 'TRAINING_PROGRESSION', 'TRAINING_PROGRESSION_STEP', 'TRAINING_PROGRESSION_ASSIGNMENT', 'PERFORMANCE_INDICATOR_TEMPLATE', 'PERFORMANCE_INDICATOR_CRITERIA_CATEGORY', 'PERFORMANCE_INDICATOR_CRITERIA', 'LESSON_PERFORMANCE_INDICATOR', 'LESSON_ROSTER_CHANGE', 'TRAINING_APPOINTMENT', 'OTS_RECOMMENDATION', 'WELCOME_MESSAGES', 'DISCORD_MESSAGE', 'DISCORD_CHANNEL_UPDATE', 'DISCORD_CONFIG', 'OPS_PLAN_FILE', 'INNOVATION_LAB_PROJECT');
ALTER TABLE "Log" ALTER COLUMN "model" TYPE "LogModel_new" USING ("model"::text::"LogModel_new");
ALTER TYPE "LogModel" RENAME TO "LogModel_old";
ALTER TYPE "LogModel_new" RENAME TO "LogModel";
DROP TYPE "public"."LogModel_old";
COMMIT;

-- AlterTable
ALTER TABLE "InnovationLabProject"
    ADD COLUMN "alias" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InnovationLabProject_alias_key" ON "InnovationLabProject" ("alias");

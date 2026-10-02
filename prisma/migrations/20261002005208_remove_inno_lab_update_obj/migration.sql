/*
  Warnings:

  - You are about to drop the `InnovationLabProjectUpdate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InnovationLabProjectUpdate" DROP CONSTRAINT "InnovationLabProjectUpdate_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "InnovationLabProjectUpdate" DROP CONSTRAINT "InnovationLabProjectUpdate_projectId_fkey";

-- DropTable
DROP TABLE "InnovationLabProjectUpdate";

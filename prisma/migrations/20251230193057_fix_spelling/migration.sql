/*
  Warnings:

  - You are about to drop the column `attempingRating` on the `OtsRecommendation` table. All the data in the column will be lost.
  - Added the required column `attemptingRating` to the `OtsRecommendation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OtsRecommendation" DROP COLUMN "attempingRating",
ADD COLUMN     "attemptingRating" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN     "goals" TEXT[] DEFAULT ARRAY[]::TEXT[];

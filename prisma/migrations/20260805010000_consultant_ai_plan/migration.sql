-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN     "intention" TEXT,
ADD COLUMN     "consultantPlan" JSONB,
ADD COLUMN     "consultantPlanMeta" JSONB;

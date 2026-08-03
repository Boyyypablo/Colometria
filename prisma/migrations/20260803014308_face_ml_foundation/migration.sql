-- CreateEnum
CREATE TYPE "FeedbackKind" AS ENUM ('HELPED', 'DID_NOT_HELP');

-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN     "detectorProvider" TEXT,
ADD COLUMN     "predictorId" TEXT;

-- CreateTable
CREATE TABLE "AnalysisSample" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "featureSchemaVersion" INTEGER NOT NULL DEFAULT 1,
    "detectorProvider" TEXT NOT NULL,
    "predictorId" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "predictedSeasonId" TEXT,
    "labelSeasonId" TEXT,
    "labelSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "kind" "FeedbackKind" NOT NULL,
    "target" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserColorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "temperatureBias" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valueBias" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "chromaBias" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "preferredSeasonId" TEXT,
    "sampleCount" INTEGER NOT NULL DEFAULT 0,
    "lastCalibratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserColorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelVersion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "predictorId" TEXT NOT NULL DEFAULT 'tabular-v1',
    "artifactPath" TEXT,
    "metrics" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisSample_analysisId_key" ON "AnalysisSample"("analysisId");

-- CreateIndex
CREATE INDEX "AnalysisSample_userId_createdAt_idx" ON "AnalysisSample"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalysisSample_labelSeasonId_idx" ON "AnalysisSample"("labelSeasonId");

-- CreateIndex
CREATE INDEX "FeedbackEvent_userId_createdAt_idx" ON "FeedbackEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "FeedbackEvent_analysisId_idx" ON "FeedbackEvent"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "UserColorProfile_userId_key" ON "UserColorProfile"("userId");

-- CreateIndex
CREATE INDEX "ModelVersion_predictorId_active_idx" ON "ModelVersion"("predictorId", "active");

-- AddForeignKey
ALTER TABLE "AnalysisSample" ADD CONSTRAINT "AnalysisSample_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisSample" ADD CONSTRAINT "AnalysisSample_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackEvent" ADD CONSTRAINT "FeedbackEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackEvent" ADD CONSTRAINT "FeedbackEvent_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserColorProfile" ADD CONSTRAINT "UserColorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

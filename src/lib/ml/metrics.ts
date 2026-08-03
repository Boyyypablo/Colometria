import { prisma } from "@/lib/db/prisma";

export type MlMetricsSnapshot = {
  analysesTotal: number;
  samplesTotal: number;
  labeledSamples: number;
  consultantLabeled: number;
  userFeedbackLabeled: number;
  predictionMatchLabeled: number;
  concordanceRate: number | null;
  feedbackTotal: number;
  feedbackHelped: number;
  feedbackDidNotHelp: number;
  topHelpedTargets: Array<{ target: string; count: number }>;
  topDidNotHelpTargets: Array<{ target: string; count: number }>;
  detectorFallbackRate: number | null;
  needsReviewRate: number | null;
  readyForTrainFloor: boolean;
};

async function topTargets(
  kind: "HELPED" | "DID_NOT_HELP",
  take = 8,
): Promise<Array<{ target: string; count: number }>> {
  const rows = await prisma.feedbackEvent.groupBy({
    by: ["target"],
    where: { kind },
    _count: { target: true },
    orderBy: { _count: { target: "desc" } },
    take,
  });
  return rows.map((r) => ({ target: r.target, count: r._count.target }));
}

export async function computeMlMetrics(): Promise<MlMetricsSnapshot> {
  const [
    analysesTotal,
    samplesTotal,
    labeledSamples,
    consultantLabeled,
    userFeedbackLabeled,
    feedbackTotal,
    feedbackHelped,
    feedbackDidNotHelp,
    needsReviewCount,
    fallbackCount,
    withDetectorCount,
    topHelpedTargets,
    topDidNotHelpTargets,
    labeledWithPrediction,
  ] = await Promise.all([
    prisma.analysis.count(),
    prisma.analysisSample.count(),
    prisma.analysisSample.count({ where: { labelSeasonId: { not: null } } }),
    prisma.analysisSample.count({
      where: { labelSource: "consultant_review" },
    }),
    prisma.analysisSample.count({
      where: { labelSource: "user_feedback" },
    }),
    prisma.feedbackEvent.count(),
    prisma.feedbackEvent.count({ where: { kind: "HELPED" } }),
    prisma.feedbackEvent.count({ where: { kind: "DID_NOT_HELP" } }),
    prisma.analysis.count({ where: { status: "NEEDS_REVIEW" } }),
    prisma.analysis.count({
      where: {
        OR: [
          { detectorProvider: { contains: "fallback" } },
          { detectorProvider: { equals: "heuristic" } },
        ],
      },
    }),
    prisma.analysis.count({
      where: { detectorProvider: { not: null } },
    }),
    topTargets("HELPED"),
    topTargets("DID_NOT_HELP"),
    prisma.analysisSample.findMany({
      where: {
        labelSeasonId: { not: null },
        predictedSeasonId: { not: null },
      },
      select: { predictedSeasonId: true, labelSeasonId: true },
    }),
  ]);

  const predictionMatchLabeled = labeledWithPrediction.filter(
    (s) => s.predictedSeasonId === s.labelSeasonId,
  ).length;
  const concordanceRate =
    labeledWithPrediction.length > 0
      ? Number(
          (predictionMatchLabeled / labeledWithPrediction.length).toFixed(3),
        )
      : null;

  const detectorFallbackRate =
    withDetectorCount > 0
      ? Number((fallbackCount / withDetectorCount).toFixed(3))
      : null;
  const needsReviewRate =
    analysesTotal > 0
      ? Number((needsReviewCount / analysesTotal).toFixed(3))
      : null;

  return {
    analysesTotal,
    samplesTotal,
    labeledSamples,
    consultantLabeled,
    userFeedbackLabeled,
    predictionMatchLabeled,
    concordanceRate,
    feedbackTotal,
    feedbackHelped,
    feedbackDidNotHelp,
    topHelpedTargets,
    topDidNotHelpTargets,
    detectorFallbackRate,
    needsReviewRate,
    readyForTrainFloor: labeledSamples >= 50,
  };
}

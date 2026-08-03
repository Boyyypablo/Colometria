import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db/prisma";

export type MlExportSummary = {
  dir: string;
  samples: number;
  feedback: number;
  labeledSamples: number;
  featureSchemaVersion: number;
  createdAt: string;
};

const ACTIVE_FEATURE_SCHEMA = 1;

function stamp(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export async function exportMlDataset(options?: {
  outRoot?: string;
  featureSchemaVersion?: number;
}): Promise<MlExportSummary> {
  const featureSchemaVersion =
    options?.featureSchemaVersion ?? ACTIVE_FEATURE_SCHEMA;
  const root = options?.outRoot ?? path.resolve(process.cwd(), "artifacts", "ml");
  const dir = path.join(root, stamp());
  await mkdir(dir, { recursive: true });

  const samples = await prisma.analysisSample.findMany({
    where: {
      featureSchemaVersion,
      OR: [
        { labelSeasonId: { not: null } },
        { analysis: { feedbackEvents: { some: {} } } },
      ],
    },
    select: {
      id: true,
      analysisId: true,
      userId: true,
      featureSchemaVersion: true,
      detectorProvider: true,
      predictorId: true,
      features: true,
      predictedSeasonId: true,
      labelSeasonId: true,
      labelSource: true,
      createdAt: true,
    },
  });

  const feedback = await prisma.feedbackEvent.findMany({
    where: {
      analysis: {
        sample: { featureSchemaVersion },
      },
    },
    select: {
      id: true,
      userId: true,
      analysisId: true,
      kind: true,
      target: true,
      note: true,
      createdAt: true,
    },
  });

  const sampleLines = samples.map((s) =>
    JSON.stringify({
      ...s,
      // sem PII — userId interno ok; email nunca exportado
      createdAt: s.createdAt.toISOString(),
    }),
  );
  const feedbackLines = feedback.map((f) =>
    JSON.stringify({
      ...f,
      createdAt: f.createdAt.toISOString(),
    }),
  );

  await writeFile(path.join(dir, "samples.jsonl"), sampleLines.join("\n") + (sampleLines.length ? "\n" : ""));
  await writeFile(
    path.join(dir, "feedback.jsonl"),
    feedbackLines.join("\n") + (feedbackLines.length ? "\n" : ""),
  );

  const labeledSamples = samples.filter((s) => s.labelSeasonId).length;
  const manifest = {
    featureSchemaVersion,
    samples: samples.length,
    labeledSamples,
    feedback: feedback.length,
    createdAt: new Date().toISOString(),
    filters: {
      requireLabelOrFeedback: true,
      featureSchemaVersion,
    },
  };
  await writeFile(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2));

  return {
    dir,
    samples: samples.length,
    feedback: feedback.length,
    labeledSamples,
    featureSchemaVersion,
    createdAt: manifest.createdAt,
  };
}

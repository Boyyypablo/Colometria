import { access } from "node:fs/promises";
import { prisma } from "@/lib/db/prisma";
import { deleteUpload, resolveUploadPath } from "@/lib/storage/local";
import {
  getRetentionCutoffDate,
  getRetentionCutoffDays,
  type AnalysisPurgeRow,
  type PurgeSummary,
} from "./types";

function collectPaths(row: AnalysisPurgeRow): string[] {
  const paths = new Set<string>();
  if (row.imagePath) paths.add(row.imagePath);
  for (const sim of row.simulations) {
    if (sim.inputPath) paths.add(sim.inputPath);
    if (sim.outputPath) paths.add(sim.outputPath);
  }
  return [...paths];
}

async function fileExists(relative: string): Promise<boolean> {
  try {
    await access(resolveUploadPath(relative));
    return true;
  } catch {
    return false;
  }
}

export async function findExpiredAnalyses(
  cutoff: Date,
): Promise<AnalysisPurgeRow[]> {
  return prisma.analysis.findMany({
    where: { createdAt: { lt: cutoff } },
    select: {
      id: true,
      imagePath: true,
      simulations: {
        select: { outputPath: true, inputPath: true },
      },
    },
  });
}

export async function purgeExpiredAnalyses(options?: {
  dryRun?: boolean;
  days?: number;
  now?: Date;
}): Promise<PurgeSummary> {
  const dryRun = Boolean(options?.dryRun);
  const retentionDays = options?.days ?? getRetentionCutoffDays();
  const cutoff = getRetentionCutoffDate(retentionDays, options?.now ?? new Date());
  const errors: string[] = [];

  const rows = await findExpiredAnalyses(cutoff);
  let filesDeleted = 0;
  let filesMissing = 0;
  let analysesDeleted = 0;

  if (dryRun) {
    let fileCount = 0;
    for (const row of rows) {
      fileCount += collectPaths(row).length;
    }
    return {
      dryRun: true,
      cutoffIso: cutoff.toISOString(),
      retentionDays,
      analysesFound: rows.length,
      analysesDeleted: 0,
      filesDeleted: fileCount,
      filesMissing: 0,
      errors,
    };
  }

  for (const row of rows) {
    const paths = collectPaths(row);
    try {
      await prisma.analysis.delete({ where: { id: row.id } });
      analysesDeleted += 1;
    } catch (err) {
      errors.push(
        `analysis ${row.id}: ${err instanceof Error ? err.message : String(err)}`,
      );
      continue;
    }

    for (const relative of paths) {
      const existed = await fileExists(relative);
      if (!existed) {
        filesMissing += 1;
        continue;
      }
      try {
        await deleteUpload(relative);
        filesDeleted += 1;
      } catch (err) {
        errors.push(
          `file ${relative}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  return {
    dryRun: false,
    cutoffIso: cutoff.toISOString(),
    retentionDays,
    analysesFound: rows.length,
    analysesDeleted,
    filesDeleted,
    filesMissing,
    errors,
  };
}

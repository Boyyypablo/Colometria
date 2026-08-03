/**
 * Retenção biométrica — purge de análises e arquivos além do TTL.
 * PHOTO_RETENTION_DAYS (default 365). Uso: npm run retention:purge [-- --dry-run] [-- --days=90]
 */

export function getRetentionCutoffDays(
  raw = process.env.PHOTO_RETENTION_DAYS,
): number {
  const n = Number.parseInt(String(raw ?? "365"), 10);
  if (!Number.isFinite(n) || n < 1) return 365;
  return n;
}

export function getRetentionCutoffDate(
  days = getRetentionCutoffDays(),
  now = new Date(),
): Date {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

export type PurgeSummary = {
  dryRun: boolean;
  cutoffIso: string;
  retentionDays: number;
  analysesFound: number;
  analysesDeleted: number;
  filesDeleted: number;
  filesMissing: number;
  errors: string[];
};

export type AnalysisPurgeRow = {
  id: string;
  imagePath: string;
  simulations: Array<{ outputPath: string | null; inputPath: string }>;
};

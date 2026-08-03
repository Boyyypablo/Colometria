import "dotenv/config";
import { purgeExpiredAnalyses } from "../src/lib/retention/purge";

function parseArgs(argv: string[]) {
  let dryRun = false;
  let days: number | undefined;
  for (const arg of argv) {
    if (arg === "--dry-run") dryRun = true;
    if (arg.startsWith("--days=")) {
      const n = Number.parseInt(arg.slice("--days=".length), 10);
      if (Number.isFinite(n) && n > 0) days = n;
    }
  }
  return { dryRun, days };
}

async function main() {
  const { dryRun, days } = parseArgs(process.argv.slice(2));
  const summary = await purgeExpiredAnalyses({ dryRun, days });
  console.log(JSON.stringify(summary, null, 2));
  if (summary.errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

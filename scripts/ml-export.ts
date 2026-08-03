import "dotenv/config";
import { exportMlDataset } from "../src/lib/ml/export";

async function main() {
  const summary = await exportMlDataset();
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

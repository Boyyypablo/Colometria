import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");

async function stats(rel: string) {
  const buf = await readFile(path.join(root, rel));
  const hash = createHash("sha256").update(buf).digest("hex").slice(0, 16);
  const channelStats = await sharp(buf).stats();
  const meta = await sharp(buf).metadata();
  return {
    rel,
    bytes: buf.length,
    hash,
    w: meta.width,
    h: meta.height,
    meanRGB: channelStats.channels.slice(0, 3).map((c) => Math.round(c.mean)),
  };
}

async function main() {
  const input = await stats(
    "cmscg7nat0000n8xsclrzq1ph/1785741575539-4997b8c9-89eb-46bf-a86e-0ec2b63ccdda.jpg",
  );
  const outPeach = await stats(
    "cmscg7nat0000n8xsclrzq1ph/1785775865161-7713f4ce-90d4-4a3f-80db-bd33b1d760c3.jpg",
  );
  const outTeal = await stats(
    "cmscg7nat0000n8xsclrzq1ph/1785775788054-301bedc0-d9a6-4910-833b-f0f3a87075a2.jpg",
  );
  console.log(JSON.stringify({ input, outPeach, outTeal }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

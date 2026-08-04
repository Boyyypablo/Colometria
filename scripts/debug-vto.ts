import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function main() {
  const p = new PrismaClient();
  const jobs = await p.simulationJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      status: true,
      provider: true,
      errorMessage: true,
      createdAt: true,
    },
  });
  console.log(JSON.stringify(jobs, null, 2));
  const k = (process.env.FAL_KEY || "").trim();
  console.log(
    JSON.stringify({
      falSet: Boolean(k),
      falLen: k.length,
      looksLikeKeyId: k.includes(":"),
      vtoProvider: process.env.VTO_PROVIDER,
    }),
  );
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
